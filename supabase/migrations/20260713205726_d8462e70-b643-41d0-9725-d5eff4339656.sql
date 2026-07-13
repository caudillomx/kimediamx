
-- Backfill missing metrics from raw JSON snapshots

-- Helper: robust numeric parser for strings like "1,234", "5%", "-", null
CREATE OR REPLACE FUNCTION public.fpk_to_num(v text) RETURNS double precision
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  s text;
  n double precision;
BEGIN
  IF v IS NULL OR v = '' OR v = '-' THEN RETURN NULL; END IF;
  s := replace(replace(replace(v, '%', ''), ' ', ''), ',', '.');
  BEGIN
    n := s::double precision;
  EXCEPTION WHEN others THEN
    RETURN NULL;
  END;
  IF n IS NULL OR n = 'NaN'::double precision THEN RETURN NULL; END IF;
  RETURN n;
END;
$$;

UPDATE public.client_portal_benchmark_metrics m
SET performance_index = public.fpk_to_num(
  COALESCE(
    m.raw->>'Índice de Rendimiento de la Página',
    m.raw->>'Índice de Rendimiento de la página',
    m.raw->>'Índice de Rendimiento',
    m.raw->>'Performance Index'
  )
)
WHERE m.performance_index IS NULL
  AND m.raw IS NOT NULL;

UPDATE public.client_portal_benchmark_metrics m
SET follower_growth_rate = public.fpk_to_num(
  COALESCE(
    m.raw->>'Crecimiento de seguidores (en %)',
    m.raw->>'Crecimiento de seguidores por día en %',
    m.raw->>'Crecimiento de seguidores'
  )
)
WHERE m.follower_growth_rate IS NULL
  AND m.raw IS NOT NULL;
