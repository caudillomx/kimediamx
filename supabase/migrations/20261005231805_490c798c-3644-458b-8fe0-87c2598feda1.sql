DROP INDEX IF EXISTS public.idx_bposts_period_interactions;
DROP INDEX IF EXISTS public.idx_bposts_period_posted;
DROP INDEX IF EXISTS public.idx_bposts_interactions_id;
DROP INDEX IF EXISTS public.idx_bposts_posted_id;
CREATE INDEX IF NOT EXISTS idx_bposts_client_interactions ON public.client_portal_benchmark_posts (client_id, interactions DESC, id);
CREATE INDEX IF NOT EXISTS idx_bposts_client_posted ON public.client_portal_benchmark_posts (client_id, posted_at DESC, id);
ANALYZE public.client_portal_benchmark_posts;