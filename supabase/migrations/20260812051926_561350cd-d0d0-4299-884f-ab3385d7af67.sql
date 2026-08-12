UPDATE public.client_portal_benchmark_posts
SET posted_at = posted_at - interval '6 hours'
WHERE posted_at IS NOT NULL;