
-- ============ Lockdown gto_dependencias ============
DROP POLICY IF EXISTS "Anyone can read dependencias" ON public.gto_dependencias;

-- ============ Lockdown gto_sesiones (keep INSERT/UPDATE public, drop SELECT) ============
DROP POLICY IF EXISTS "Anyone can read sesiones" ON public.gto_sesiones;

-- ============ Lockdown gto_participantes (keep INSERT/UPDATE public, drop SELECT) ============
DROP POLICY IF EXISTS "Anyone can read participantes" ON public.gto_participantes;

-- ============ Lockdown access_codes (drop anon SELECT) ============
DROP POLICY IF EXISTS "Anyone can validate codes" ON public.access_codes;

-- ============ Lockdown gto_corpus_uploads (drop public SELECT, keep INSERT) ============
DROP POLICY IF EXISTS "Anyone can read corpus uploads" ON public.gto_corpus_uploads;

-- ============ Access log table ============
CREATE TABLE IF NOT EXISTS public.gto_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  code_attempt text,
  success boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gto_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read access log" ON public.gto_access_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ RPC: validate access code (callable from edge with service role) ============
CREATE OR REPLACE FUNCTION public.gto_validate_access_code(_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dep record;
BEGIN
  SELECT id, nombre, siglas
  INTO dep
  FROM public.gto_dependencias
  WHERE access_code = _code
  LIMIT 1;

  IF dep IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;

  RETURN json_build_object(
    'valid', true,
    'id', dep.id,
    'nombre', dep.nombre,
    'siglas', dep.siglas
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.gto_validate_access_code(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gto_validate_access_code(text) TO service_role;

-- ============ RPC: bootstrap session for localStorage restore ============
-- Returns sesion + dependencia + participante ONLY if both IDs match (i.e. caller proves
-- they hold both the sesion_id AND participante_id pair stored in their browser).
CREATE OR REPLACE FUNCTION public.gto_bootstrap_session(_sesion_id uuid, _participante_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s record;
  d record;
  p record;
BEGIN
  SELECT * INTO p FROM public.gto_participantes
  WHERE id = _participante_id AND sesion_id = _sesion_id LIMIT 1;
  IF p IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;

  SELECT * INTO s FROM public.gto_sesiones WHERE id = _sesion_id LIMIT 1;
  IF s IS NULL THEN
    RETURN json_build_object('valid', false);
  END IF;

  SELECT id, nombre, siglas INTO d FROM public.gto_dependencias WHERE id = s.dependencia_id LIMIT 1;

  RETURN json_build_object(
    'valid', true,
    'sesion', row_to_json(s),
    'participante', json_build_object(
      'id', p.id, 'nombre', p.nombre, 'cargo', p.cargo, 'email', p.email,
      'ultimo_paso', p.ultimo_paso
    ),
    'dependencia', json_build_object('id', d.id, 'nombre', d.nombre, 'siglas', d.siglas)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.gto_bootstrap_session(uuid, uuid) TO anon, authenticated;
