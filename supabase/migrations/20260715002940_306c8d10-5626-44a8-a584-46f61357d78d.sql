
ALTER TABLE public.client_portal_benchmark_competitors
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'general';

-- Backfill: infer scope from periods where each competitor has metrics
WITH inferred AS (
  SELECT DISTINCT ON (m.competitor_id)
    m.competitor_id,
    p.scope
  FROM public.client_portal_benchmark_metrics m
  JOIN public.client_portal_benchmark_periods p ON p.id = m.period_id
  WHERE p.scope IN ('funcionarios','instituciones')
  ORDER BY m.competitor_id, p.period_start DESC
)
UPDATE public.client_portal_benchmark_competitors c
SET scope = i.scope
FROM inferred i
WHERE i.competitor_id = c.id;

CREATE INDEX IF NOT EXISTS idx_bench_competitors_client_scope
  ON public.client_portal_benchmark_competitors(client_id, scope);
