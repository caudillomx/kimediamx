
-- Content profiles: editorial identity per client
CREATE TABLE public.content_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL UNIQUE,
  industry text,
  target_audience text,
  brand_tone text,
  content_pillars text[] DEFAULT '{}',
  preferred_networks text[] DEFAULT '{}',
  posting_frequency text,
  hashtag_groups jsonb DEFAULT '{}',
  restrictions text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content cycles: each planning period
CREATE TABLE public.content_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  cycle_type text NOT NULL DEFAULT 'mensual',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'briefing',
  briefing_data jsonb DEFAULT '{}',
  ai_recommendations text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content pieces: individual posts within a cycle
CREATE TABLE public.content_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.content_cycles(id) ON DELETE CASCADE,
  scheduled_date date,
  network text NOT NULL,
  format text NOT NULL,
  pillar text,
  objective text,
  draft_copy text,
  final_copy text,
  hashtags text[] DEFAULT '{}',
  cta text,
  design_prompt text,
  tone text,
  status text NOT NULL DEFAULT 'pendiente',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Content analytics: imported FanPage Karma data
CREATE TABLE public.content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  piece_id uuid REFERENCES public.content_pieces(id) ON DELETE SET NULL,
  published_date date,
  network text,
  post_type text,
  post_text text,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  engagement integer DEFAULT 0,
  reactions integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  video_views integer DEFAULT 0,
  engagement_rate numeric(6,4) DEFAULT 0,
  import_batch text,
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ad campaigns: imported paid media campaigns
CREATE TABLE public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  campaign_name text NOT NULL,
  campaign_id_external text,
  objective text,
  budget numeric(12,2) DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  import_batch text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ad performance: metrics per ad/ad set
CREATE TABLE public.ad_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  ad_name text,
  ad_set_name text,
  report_date date,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  spend numeric(12,2) DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_value numeric(12,2) DEFAULT 0,
  cpc numeric(8,4) DEFAULT 0,
  cpm numeric(8,4) DEFAULT 0,
  ctr numeric(6,4) DEFAULT 0,
  roas numeric(8,4) DEFAULT 0,
  reach integer DEFAULT 0,
  frequency numeric(6,2) DEFAULT 0,
  raw_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Client reports: generated report history
CREATE TABLE public.client_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL DEFAULT 'monthly',
  period_start date NOT NULL,
  period_end date NOT NULL,
  title text NOT NULL,
  summary text,
  recommendations text,
  file_url text,
  generated_by text DEFAULT 'ai',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Content learnings: AI insights accumulated over time
CREATE TABLE public.content_learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.content_cycles(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general',
  insight text NOT NULL,
  confidence numeric(3,2) DEFAULT 0.5,
  source text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.content_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_learnings ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Authenticated can read content_profiles" ON public.content_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read content_cycles" ON public.content_cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read content_pieces" ON public.content_pieces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read content_analytics" ON public.content_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read ad_campaigns" ON public.ad_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read ad_performance" ON public.ad_performance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read client_reports" ON public.client_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read content_learnings" ON public.content_learnings FOR SELECT TO authenticated USING (true);

-- Admin full access
CREATE POLICY "Admins manage content_profiles" ON public.content_profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage content_cycles" ON public.content_cycles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage content_pieces" ON public.content_pieces FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage content_analytics" ON public.content_analytics FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ad_campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ad_performance" ON public.ad_performance FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage client_reports" ON public.client_reports FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage content_learnings" ON public.content_learnings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated users can insert/update for workflow
CREATE POLICY "Authenticated can insert content_cycles" ON public.content_cycles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update content_cycles" ON public.content_cycles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can insert content_pieces" ON public.content_pieces FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update content_pieces" ON public.content_pieces FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can insert content_profiles" ON public.content_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update content_profiles" ON public.content_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can insert content_analytics" ON public.content_analytics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can insert ad_campaigns" ON public.ad_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update ad_campaigns" ON public.ad_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can insert ad_performance" ON public.ad_performance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can insert client_reports" ON public.client_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can insert content_learnings" ON public.content_learnings FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for content_pieces (for live collaboration)
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_pieces;
