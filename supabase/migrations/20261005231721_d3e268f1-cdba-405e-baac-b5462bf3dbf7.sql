CREATE INDEX IF NOT EXISTS idx_bposts_period_interactions ON public.client_portal_benchmark_posts (period_id, interactions DESC NULLS LAST, id);
CREATE INDEX IF NOT EXISTS idx_bposts_period_posted ON public.client_portal_benchmark_posts (period_id, posted_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_bposts_interactions_id ON public.client_portal_benchmark_posts (interactions DESC NULLS LAST, id);
CREATE INDEX IF NOT EXISTS idx_bposts_posted_id ON public.client_portal_benchmark_posts (posted_at DESC, id);