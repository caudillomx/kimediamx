
CREATE TABLE public.client_portal_social_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  network text NOT NULL,
  account_key text NOT NULL,
  account_name text NOT NULL,
  account_handle text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_label text,
  source text NOT NULL DEFAULT 'fanpage_karma',
  followers numeric,
  follower_growth numeric,
  follower_growth_rate numeric,
  posts numeric,
  interactions numeric,
  engagement_rate numeric,
  impressions numeric,
  reach numeric,
  performance_index numeric,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, network, account_key, period_start, period_end)
);

CREATE TABLE public.client_portal_web_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_label text,
  users numeric,
  new_users numeric,
  sessions numeric,
  pageviews numeric,
  avg_session_seconds numeric,
  bounce_rate numeric,
  conversions numeric,
  channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, period_start, period_end)
);

CREATE TABLE public.client_portal_ads_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform text NOT NULL,
  campaign_key text NOT NULL,
  campaign_name text NOT NULL,
  objective text,
  period_start date NOT NULL,
  period_end date NOT NULL,
  period_label text,
  spend numeric,
  impressions numeric,
  reach numeric,
  clicks numeric,
  ctr numeric,
  cpc numeric,
  cpm numeric,
  results numeric,
  result_type text,
  cost_per_result numeric,
  conversions numeric,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, platform, campaign_key, period_start, period_end)
);

CREATE INDEX idx_cpsm_client_period ON public.client_portal_social_metrics (client_id, period_end DESC);
CREATE INDEX idx_cpwa_client_period ON public.client_portal_web_analytics (client_id, period_end DESC);
CREATE INDEX idx_cpam_client_period ON public.client_portal_ads_metrics (client_id, period_end DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_social_metrics TO authenticated;
GRANT ALL ON public.client_portal_social_metrics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_web_analytics TO authenticated;
GRANT ALL ON public.client_portal_web_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_ads_metrics TO authenticated;
GRANT ALL ON public.client_portal_ads_metrics TO service_role;

ALTER TABLE public.client_portal_social_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_web_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_ads_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cpsm_read" ON public.client_portal_social_metrics FOR SELECT TO authenticated
  USING (public.has_ops_read(auth.uid()) OR public.has_client_access(auth.uid(), client_id));
CREATE POLICY "cpsm_write" ON public.client_portal_social_metrics FOR ALL TO authenticated
  USING (public.has_ops_write(auth.uid())) WITH CHECK (public.has_ops_write(auth.uid()));

CREATE POLICY "cpwa_read" ON public.client_portal_web_analytics FOR SELECT TO authenticated
  USING (public.has_ops_read(auth.uid()) OR public.has_client_access(auth.uid(), client_id));
CREATE POLICY "cpwa_write" ON public.client_portal_web_analytics FOR ALL TO authenticated
  USING (public.has_ops_write(auth.uid())) WITH CHECK (public.has_ops_write(auth.uid()));

CREATE POLICY "cpam_read" ON public.client_portal_ads_metrics FOR SELECT TO authenticated
  USING (public.has_ops_read(auth.uid()) OR public.has_client_access(auth.uid(), client_id));
CREATE POLICY "cpam_write" ON public.client_portal_ads_metrics FOR ALL TO authenticated
  USING (public.has_ops_write(auth.uid())) WITH CHECK (public.has_ops_write(auth.uid()));

CREATE TRIGGER trg_cpsm_updated BEFORE UPDATE ON public.client_portal_social_metrics
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
CREATE TRIGGER trg_cpwa_updated BEFORE UPDATE ON public.client_portal_web_analytics
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
CREATE TRIGGER trg_cpam_updated BEFORE UPDATE ON public.client_portal_ads_metrics
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
