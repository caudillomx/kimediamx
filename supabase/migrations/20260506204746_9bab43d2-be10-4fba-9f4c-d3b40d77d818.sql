
CREATE TABLE public.ads_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'borrador',
  platforms TEXT[] NOT NULL DEFAULT '{}',
  business_objective TEXT,
  campaign_objectives TEXT[],
  budget_total NUMERIC,
  budget_currency TEXT DEFAULT 'MXN',
  flight_start DATE,
  flight_end DATE,
  target_audience_brief TEXT,
  proposal_data JSONB,
  internal_brief JSONB,
  generated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ads_proposals_client_id ON public.ads_proposals(client_id);

CREATE TABLE public.ads_proposal_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.ads_proposals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  impressions INTEGER,
  reach INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  spend NUMERIC,
  currency TEXT DEFAULT 'MXN',
  ctr NUMERIC,
  cpm NUMERIC,
  cpc NUMERIC,
  roas NUMERIC,
  raw_metrics JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ads_proposal_perf_client ON public.ads_proposal_performance(client_id);
CREATE INDEX idx_ads_proposal_perf_proposal ON public.ads_proposal_performance(proposal_id);

ALTER TABLE public.ads_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_proposal_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage ads_proposals" ON public.ads_proposals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read ads_proposals" ON public.ads_proposals
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert ads_proposals" ON public.ads_proposals
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update ads_proposals" ON public.ads_proposals
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete ads_proposals" ON public.ads_proposals
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Admins manage ads_proposal_performance" ON public.ads_proposal_performance
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read ads_proposal_performance" ON public.ads_proposal_performance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert ads_proposal_performance" ON public.ads_proposal_performance
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update ads_proposal_performance" ON public.ads_proposal_performance
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete ads_proposal_performance" ON public.ads_proposal_performance
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trg_ads_proposals_updated_at
  BEFORE UPDATE ON public.ads_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();
