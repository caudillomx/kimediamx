CREATE TABLE public.cf27_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  nombre text NOT NULL,
  estado text NOT NULL,
  municipio text NOT NULL,
  integrantes int NOT NULL DEFAULT 4,
  ex1 jsonb NOT NULL DEFAULT '{}'::jsonb,
  ex2 jsonb NOT NULL DEFAULT '{}'::jsonb,
  ex3 jsonb NOT NULL DEFAULT '{}'::jsonb,
  ex4 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cf27_teams ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cf27_teams FROM anon, authenticated;
GRANT SELECT (id, nombre, estado, municipio, integrantes, ex1, ex2, ex3, ex4, created_at, updated_at) ON public.cf27_teams TO anon, authenticated;
GRANT ALL ON public.cf27_teams TO service_role;
CREATE POLICY "Public read workshop teams" ON public.cf27_teams FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.cf27_register_team(p_token text, p_nombre text, p_estado text, p_municipio text, p_integrantes int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  IF length(p_token) NOT BETWEEN 16 AND 64 OR length(trim(p_nombre)) NOT BETWEEN 1 AND 60
     OR length(trim(p_estado)) NOT BETWEEN 1 AND 60 OR length(trim(p_municipio)) NOT BETWEEN 1 AND 80
     OR p_integrantes NOT BETWEEN 1 AND 12 THEN RAISE EXCEPTION 'invalid'; END IF;
  INSERT INTO cf27_teams(token, nombre, estado, municipio, integrantes)
  VALUES (p_token, trim(p_nombre), trim(p_estado), trim(p_municipio), p_integrantes)
  ON CONFLICT (token) DO UPDATE SET nombre = excluded.nombre, estado = excluded.estado, municipio = excluded.municipio, integrantes = excluded.integrantes, updated_at = now()
  RETURNING id INTO v;
  RETURN v;
END $$;

CREATE OR REPLACE FUNCTION public.cf27_save_exercise(p_token text, p_ex int, p_data jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_ex NOT BETWEEN 1 AND 4 OR jsonb_typeof(p_data) <> 'object' OR length(p_data::text) > 6000 THEN RAISE EXCEPTION 'invalid'; END IF;
  UPDATE cf27_teams SET
    ex1 = CASE WHEN p_ex = 1 THEN p_data ELSE ex1 END,
    ex2 = CASE WHEN p_ex = 2 THEN p_data ELSE ex2 END,
    ex3 = CASE WHEN p_ex = 3 THEN p_data ELSE ex3 END,
    ex4 = CASE WHEN p_ex = 4 THEN p_data ELSE ex4 END,
    updated_at = now()
  WHERE token = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'team not found'; END IF;
END $$;

REVOKE ALL ON FUNCTION public.cf27_register_team(text, text, text, text, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cf27_save_exercise(text, int, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cf27_register_team(text, text, text, text, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cf27_save_exercise(text, int, jsonb) TO anon, authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cf27_teams;