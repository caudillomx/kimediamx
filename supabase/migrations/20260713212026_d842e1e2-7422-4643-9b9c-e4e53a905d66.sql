-- Narratives cache per brand/network/date-range
CREATE TABLE public.client_portal_benchmark_narratives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  competitor_id uuid REFERENCES public.client_portal_benchmark_competitors(id) ON DELETE SET NULL,
  profile_name text NOT NULL,
  network text NOT NULL,
  range_start date NOT NULL,
  range_end date NOT NULL,
  narratives jsonb NOT NULL DEFAULT '{}'::jsonb,
  posts_sampled integer NOT NULL DEFAULT 0,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, profile_name, network, range_start, range_end)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_narratives TO authenticated;
GRANT ALL ON public.client_portal_benchmark_narratives TO service_role;

ALTER TABLE public.client_portal_benchmark_narratives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "narratives_client_access"
ON public.client_portal_benchmark_narratives
FOR ALL
TO authenticated
USING (public.has_client_access(auth.uid(), client_id))
WITH CHECK (public.has_client_access(auth.uid(), client_id));

CREATE INDEX idx_bnarr_client_range ON public.client_portal_benchmark_narratives (client_id, range_start, range_end);

-- Strategy reports (Listening x Benchmark)
CREATE TABLE public.client_portal_strategy_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  range_start date NOT NULL,
  range_end date NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, range_start, range_end)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_strategy_reports TO authenticated;
GRANT ALL ON public.client_portal_strategy_reports TO service_role;

ALTER TABLE public.client_portal_strategy_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strategy_reports_client_access"
ON public.client_portal_strategy_reports
FOR ALL
TO authenticated
USING (public.has_client_access(auth.uid(), client_id))
WITH CHECK (public.has_client_access(auth.uid(), client_id));

CREATE INDEX idx_strategy_client_range ON public.client_portal_strategy_reports (client_id, range_start, range_end);