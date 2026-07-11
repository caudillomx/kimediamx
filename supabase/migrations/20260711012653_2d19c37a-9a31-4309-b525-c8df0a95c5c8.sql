
-- 1. Drop old tables (empty)
DROP TABLE IF EXISTS public.client_portal_benchmark_metrics CASCADE;
DROP TABLE IF EXISTS public.client_portal_benchmark_weeks CASCADE;

-- 2. Restructure competitors: network is now part of identity
ALTER TABLE public.client_portal_benchmark_competitors
  DROP CONSTRAINT IF EXISTS ux_benchmark_competitors_client_name;

ALTER TABLE public.client_portal_benchmark_competitors
  ADD COLUMN IF NOT EXISTS network text NOT NULL DEFAULT 'multi',
  ADD COLUMN IF NOT EXISTS profile_external_id text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS external_url text,
  ADD COLUMN IF NOT EXISTS is_client boolean NOT NULL DEFAULT false;

-- Drop old preloaded 'multi' rows for Actinver so they get auto-registered per network from XLSX
DELETE FROM public.client_portal_benchmark_competitors
WHERE client_id = '1b3831de-23f1-4aa7-a40f-8288ff70fb1d';

CREATE UNIQUE INDEX IF NOT EXISTS ux_benchmark_competitors_client_name_network
  ON public.client_portal_benchmark_competitors (client_id, lower(name), lower(network));

-- 3. Periods table (replaces weeks)
CREATE TABLE public.client_portal_benchmark_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_type text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('weekly','monthly','custom')),
  period_label text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_periods TO authenticated;
GRANT ALL ON public.client_portal_benchmark_periods TO service_role;
ALTER TABLE public.client_portal_benchmark_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gestionan periodos benchmark" ON public.client_portal_benchmark_periods
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Portal cliente lee periodos benchmark" ON public.client_portal_benchmark_periods
  FOR SELECT TO authenticated
  USING (has_client_access(auth.uid(), client_id));
CREATE TRIGGER trg_benchmark_periods_updated
  BEFORE UPDATE ON public.client_portal_benchmark_periods
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

-- 4. Uploads registry
CREATE TABLE public.client_portal_benchmark_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES public.client_portal_benchmark_periods(id) ON DELETE CASCADE,
  upload_type text NOT NULL CHECK (upload_type IN ('comparativa','seguidores','posts')),
  file_name text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, upload_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_uploads TO authenticated;
GRANT ALL ON public.client_portal_benchmark_uploads TO service_role;
ALTER TABLE public.client_portal_benchmark_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gestionan uploads benchmark" ON public.client_portal_benchmark_uploads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Portal cliente lee uploads benchmark" ON public.client_portal_benchmark_uploads
  FOR SELECT TO authenticated
  USING (has_client_access(auth.uid(), client_id));

-- 5. Aggregate metrics (from Comparativa file)
CREATE TABLE public.client_portal_benchmark_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES public.client_portal_benchmark_periods(id) ON DELETE CASCADE,
  competitor_id uuid NOT NULL REFERENCES public.client_portal_benchmark_competitors(id) ON DELETE CASCADE,
  network text NOT NULL,
  performance_index numeric,
  followers integer,
  follower_growth_rate numeric,
  engagement_rate numeric,
  posts_per_day numeric,
  reach_per_day numeric,
  interaction_per_impression numeric,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, competitor_id, network)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_metrics TO authenticated;
GRANT ALL ON public.client_portal_benchmark_metrics TO service_role;
ALTER TABLE public.client_portal_benchmark_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gestionan métricas benchmark" ON public.client_portal_benchmark_metrics
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Portal cliente lee métricas benchmark" ON public.client_portal_benchmark_metrics
  FOR SELECT TO authenticated
  USING (has_client_access(auth.uid(), client_id));
CREATE INDEX idx_benchmark_metrics_period ON public.client_portal_benchmark_metrics(period_id);
CREATE INDEX idx_benchmark_metrics_competitor ON public.client_portal_benchmark_metrics(competitor_id);

-- 6. Follower daily deltas (from Seguidores file)
CREATE TABLE public.client_portal_benchmark_follower_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES public.client_portal_benchmark_periods(id) ON DELETE CASCADE,
  competitor_id uuid NOT NULL REFERENCES public.client_portal_benchmark_competitors(id) ON DELETE CASCADE,
  network text NOT NULL,
  day date NOT NULL,
  delta integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competitor_id, network, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_follower_daily TO authenticated;
GRANT ALL ON public.client_portal_benchmark_follower_daily TO service_role;
ALTER TABLE public.client_portal_benchmark_follower_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gestionan follower daily" ON public.client_portal_benchmark_follower_daily
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Portal cliente lee follower daily" ON public.client_portal_benchmark_follower_daily
  FOR SELECT TO authenticated
  USING (has_client_access(auth.uid(), client_id));
CREATE INDEX idx_benchmark_follower_daily_period ON public.client_portal_benchmark_follower_daily(period_id);
CREATE INDEX idx_benchmark_follower_daily_day ON public.client_portal_benchmark_follower_daily(day);

-- 7. Posts (from Posts file)
CREATE TABLE public.client_portal_benchmark_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES public.client_portal_benchmark_periods(id) ON DELETE CASCADE,
  competitor_id uuid REFERENCES public.client_portal_benchmark_competitors(id) ON DELETE CASCADE,
  network text NOT NULL,
  profile_name text NOT NULL,
  message_external_id text,
  posted_at timestamptz,
  message text,
  likes integer,
  comments integer,
  interactions integer,
  engagement_rate numeric,
  reach numeric,
  interaction_per_impression numeric,
  link text,
  image_link text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, network, message_external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_posts TO authenticated;
GRANT ALL ON public.client_portal_benchmark_posts TO service_role;
ALTER TABLE public.client_portal_benchmark_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins gestionan posts benchmark" ON public.client_portal_benchmark_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Portal cliente lee posts benchmark" ON public.client_portal_benchmark_posts
  FOR SELECT TO authenticated
  USING (has_client_access(auth.uid(), client_id));
CREATE INDEX idx_benchmark_posts_period ON public.client_portal_benchmark_posts(period_id);
CREATE INDEX idx_benchmark_posts_competitor ON public.client_portal_benchmark_posts(competitor_id);
CREATE INDEX idx_benchmark_posts_posted_at ON public.client_portal_benchmark_posts(posted_at DESC);
