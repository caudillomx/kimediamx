DROP INDEX IF EXISTS public.ux_benchmark_competitors_client_name;
CREATE UNIQUE INDEX IF NOT EXISTS ux_benchmark_competitors_client_name_network
  ON public.client_portal_benchmark_competitors (client_id, lower(name), lower(network));