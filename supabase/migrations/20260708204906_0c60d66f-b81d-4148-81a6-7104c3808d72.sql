
-- 1. app_settings: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Authenticated can read settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);

-- 2. gto_corpus_uploads: drop broad public SELECT (clients use gto_list_corpus_uploads RPC)
DROP POLICY IF EXISTS "Public can read own corpus upload row" ON public.gto_corpus_uploads;

-- 3. gto_diagnostico_textos: drop broad public SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS "Anyone can read diagnosticos" ON public.gto_diagnostico_textos;
DROP POLICY IF EXISTS "Anyone can create diagnosticos" ON public.gto_diagnostico_textos;
DROP POLICY IF EXISTS "Anyone can update diagnosticos" ON public.gto_diagnostico_textos;

-- 4. gto_participantes: drop broad public UPDATE
DROP POLICY IF EXISTS "Anyone can update participantes" ON public.gto_participantes;

-- 5. gto_sesiones: drop broad public UPDATE
DROP POLICY IF EXISTS "Anyone can update sesiones" ON public.gto_sesiones;

-- 6. Storage: drop public listing of avatars (bucket stays public for direct URLs)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 7. Revoke EXECUTE on internal SECURITY DEFINER functions not called from client
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_code_usage(text) FROM anon, authenticated, PUBLIC;

-- 8. RPCs for scoped participant/session operations (SECURITY DEFINER, verify pairing)

-- List diagnostics for a participant, only if participante belongs to sesion
CREATE OR REPLACE FUNCTION public.gto_list_diagnosticos(_sesion_id uuid, _participante_id uuid)
RETURNS SETOF public.gto_diagnostico_textos
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gto_participantes
    WHERE id = _participante_id AND sesion_id = _sesion_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    SELECT * FROM public.gto_diagnostico_textos
    WHERE participante_id = _participante_id
    ORDER BY created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.gto_list_diagnosticos(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gto_list_diagnosticos(uuid, uuid) TO anon, authenticated;

-- Insert a diagnostic on behalf of a participant
CREATE OR REPLACE FUNCTION public.gto_insert_diagnostico(
  _sesion_id uuid,
  _participante_id uuid,
  _participante_nombre text,
  _titulo text,
  _texto_original text,
  _errores_detectados jsonb,
  _resumen_diagnostico text,
  _score_calidad integer
)
RETURNS public.gto_diagnostico_textos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.gto_diagnostico_textos;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gto_participantes
    WHERE id = _participante_id AND sesion_id = _sesion_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.gto_diagnostico_textos (
    sesion_id, participante_id, participante_nombre,
    titulo, texto_original, errores_detectados,
    resumen_diagnostico, score_calidad, analizado_at
  ) VALUES (
    _sesion_id, _participante_id, _participante_nombre,
    _titulo, _texto_original, COALESCE(_errores_detectados, '[]'::jsonb),
    _resumen_diagnostico, _score_calidad, now()
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.gto_insert_diagnostico(uuid, uuid, text, text, text, jsonb, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gto_insert_diagnostico(uuid, uuid, text, text, text, jsonb, text, integer) TO anon, authenticated;

-- Update participante progress (activity, ultimo_paso)
CREATE OR REPLACE FUNCTION public.gto_update_participante_progress(
  _sesion_id uuid,
  _participante_id uuid,
  _ultimo_paso integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gto_participantes
    WHERE id = _participante_id AND sesion_id = _sesion_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.gto_participantes
  SET ultima_actividad = now(),
      ultimo_paso = COALESCE(_ultimo_paso, ultimo_paso)
  WHERE id = _participante_id;
END;
$$;
REVOKE ALL ON FUNCTION public.gto_update_participante_progress(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gto_update_participante_progress(uuid, uuid, integer) TO anon, authenticated;

-- Generic scoped sesion patch (whitelist of columns)
CREATE OR REPLACE FUNCTION public.gto_update_sesion(
  _sesion_id uuid,
  _participante_id uuid,
  _patch jsonb
)
RETURNS public.gto_sesiones
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.gto_sesiones;
  v_allowed text[] := ARRAY[
    'titular_nombre','titular_cargo','herramienta_ia',
    'brief_mision','brief_audiencias','brief_tono',
    'brief_terminos_prohibidos','brief_terminos_preferidos',
    'brief_mensajes_clave','brief_tipo_texto',
    'corpus_documentos','corpus_notas',
    'prompt_sistema','prompt_generado_at',
    'compromiso_corpus_subido','compromiso_prompt_probado','compromiso_resultado_compartido',
    'notas_kimedia','estado','paso_actual','completed_at'
  ];
  v_clean jsonb := '{}'::jsonb;
  v_key text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gto_participantes
    WHERE id = _participante_id AND sesion_id = _sesion_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(_patch)
  LOOP
    IF v_key = ANY(v_allowed) THEN
      v_clean := v_clean || jsonb_build_object(v_key, _patch->v_key);
    END IF;
  END LOOP;

  UPDATE public.gto_sesiones
  SET
    titular_nombre = COALESCE(v_clean->>'titular_nombre', titular_nombre),
    titular_cargo = COALESCE(v_clean->>'titular_cargo', titular_cargo),
    herramienta_ia = COALESCE(v_clean->>'herramienta_ia', herramienta_ia),
    brief_mision = COALESCE(v_clean->>'brief_mision', brief_mision),
    brief_audiencias = COALESCE(v_clean->'brief_audiencias', brief_audiencias),
    brief_tono = COALESCE(v_clean->>'brief_tono', brief_tono),
    brief_terminos_prohibidos = COALESCE(v_clean->'brief_terminos_prohibidos', brief_terminos_prohibidos),
    brief_terminos_preferidos = COALESCE(v_clean->'brief_terminos_preferidos', brief_terminos_preferidos),
    brief_mensajes_clave = COALESCE(v_clean->'brief_mensajes_clave', brief_mensajes_clave),
    brief_tipo_texto = COALESCE(v_clean->>'brief_tipo_texto', brief_tipo_texto),
    corpus_documentos = COALESCE(v_clean->'corpus_documentos', corpus_documentos),
    corpus_notas = COALESCE(v_clean->>'corpus_notas', corpus_notas),
    prompt_sistema = COALESCE(v_clean->>'prompt_sistema', prompt_sistema),
    prompt_generado_at = COALESCE((v_clean->>'prompt_generado_at')::timestamptz, prompt_generado_at),
    compromiso_corpus_subido = COALESCE((v_clean->>'compromiso_corpus_subido')::boolean, compromiso_corpus_subido),
    compromiso_prompt_probado = COALESCE((v_clean->>'compromiso_prompt_probado')::boolean, compromiso_prompt_probado),
    compromiso_resultado_compartido = COALESCE((v_clean->>'compromiso_resultado_compartido')::boolean, compromiso_resultado_compartido),
    notas_kimedia = COALESCE(v_clean->>'notas_kimedia', notas_kimedia),
    estado = COALESCE(v_clean->>'estado', estado),
    paso_actual = COALESCE((v_clean->>'paso_actual')::integer, paso_actual),
    completed_at = COALESCE((v_clean->>'completed_at')::timestamptz, completed_at)
  WHERE id = _sesion_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.gto_update_sesion(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gto_update_sesion(uuid, uuid, jsonb) TO anon, authenticated;
