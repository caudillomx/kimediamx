-- Votes: no direct row reads; aggregated tally + cast through RPCs
DROP POLICY IF EXISTS "Public read votes" ON public.cfl_votes;
DROP POLICY IF EXISTS "Public change own vote" ON public.cfl_votes;
DROP POLICY IF EXISTS "Public cast vote" ON public.cfl_votes;
REVOKE SELECT, INSERT, UPDATE ON public.cfl_votes FROM anon, authenticated;
ALTER PUBLICATION supabase_realtime DROP TABLE public.cfl_votes;

CREATE OR REPLACE FUNCTION public.cfl_cast_vote(p_question text, p_option text, p_voter text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF p_question IS NULL OR length(p_question) NOT BETWEEN 1 AND 40 OR p_option IS NULL OR length(p_option) NOT BETWEEN 1 AND 60
     OR p_voter IS NULL OR length(p_voter) NOT BETWEEN 8 AND 64 THEN RAISE EXCEPTION 'invalid'; END IF;
  INSERT INTO cfl_votes(question, option, voter) VALUES (p_question, p_option, p_voter)
  ON CONFLICT (question, voter) DO UPDATE SET option = excluded.option;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.cfl_vote_tally(p_prefix text, p_voter text)
RETURNS TABLE(question text, option text, n bigint, mine boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT v.question, v.option, count(*)::bigint, bool_or(v.voter = p_voter)
  FROM cfl_votes v
  WHERE (p_prefix IS NULL OR p_prefix = '' OR v.question LIKE p_prefix || '%')
  GROUP BY v.question, v.option
$$;
GRANT EXECUTE ON FUNCTION public.cfl_cast_vote(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cfl_vote_tally(text, text) TO anon, authenticated;

-- GTO corpus list: require the matching session + participant pair
REVOKE EXECUTE ON FUNCTION public.gto_list_corpus_uploads(uuid) FROM PUBLIC, anon, authenticated;
DROP FUNCTION public.gto_list_corpus_uploads(uuid);
CREATE FUNCTION public.gto_list_corpus_uploads(_sesion_id uuid, _participante_id uuid)
RETURNS TABLE(id uuid, doc_tipo text, file_name text, storage_path text, file_size bigint, mime_type text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gto_participantes p WHERE p.id = _participante_id AND p.sesion_id = _sesion_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT u.id, u.doc_tipo, u.file_name, u.storage_path, u.file_size, u.mime_type, u.created_at
  FROM gto_corpus_uploads u
  WHERE u.participante_id = _participante_id AND u.sesion_id = _sesion_id
  ORDER BY u.created_at DESC;
END $$;
REVOKE EXECUTE ON FUNCTION public.gto_list_corpus_uploads(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gto_list_corpus_uploads(uuid, uuid) TO anon, authenticated;

-- GTO bootstrap: only the participant's own session fields, never internal dependency data
CREATE OR REPLACE FUNCTION public.gto_bootstrap_session(_sesion_id uuid, _participante_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s record; d record; p record;
BEGIN
  SELECT id, nombre, cargo, email, ultimo_paso INTO p FROM gto_participantes
  WHERE id = _participante_id AND sesion_id = _sesion_id LIMIT 1;
  IF p IS NULL THEN RETURN json_build_object('valid', false); END IF;
  SELECT id, dependencia_id, titular_nombre, titular_cargo, herramienta_ia, brief_mision, brief_audiencias, brief_tono,
         brief_terminos_prohibidos, brief_terminos_preferidos, brief_mensajes_clave, brief_tipo_texto,
         corpus_documentos, corpus_notas, prompt_sistema, prompt_generado_at,
         compromiso_corpus_subido, compromiso_prompt_probado, compromiso_resultado_compartido,
         notas_kimedia, estado, paso_actual, completed_at
  INTO s FROM gto_sesiones WHERE id = _sesion_id LIMIT 1;
  IF s IS NULL THEN RETURN json_build_object('valid', false); END IF;
  SELECT id, nombre, siglas INTO d FROM gto_dependencias WHERE id = s.dependencia_id LIMIT 1;
  RETURN json_build_object('valid', true, 'sesion', row_to_json(s),
    'participante', row_to_json(p),
    'dependencia', json_build_object('id', d.id, 'nombre', d.nombre, 'siglas', d.siglas));
END $$;