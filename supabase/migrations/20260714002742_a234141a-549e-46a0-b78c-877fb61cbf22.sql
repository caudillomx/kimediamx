
-- Enable separate benchmark modules for Guanajuato
UPDATE public.clients
SET portal_modules = coalesce(portal_modules, '{}'::jsonb)
  || jsonb_build_object('benchmark_funcionarios', true, 'benchmark_instituciones', true)
WHERE id = '651190b4-7787-4814-af9a-b5aff22d9297';

-- Allow one period per (client, start, end, scope) so funcionarios and
-- instituciones can share date ranges without collision.
ALTER TABLE public.client_portal_benchmark_periods
  DROP CONSTRAINT IF EXISTS client_portal_benchmark_perio_client_id_period_start_period_key;

ALTER TABLE public.client_portal_benchmark_periods
  ADD CONSTRAINT client_portal_benchmark_periods_scope_key
  UNIQUE (client_id, period_start, period_end, scope);
