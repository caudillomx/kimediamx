
-- Keywords de tendencias por cliente (permanentes)
CREATE TABLE public.client_trend_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  source text DEFAULT 'manual', -- 'manual' | 'ai_suggested'
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Resultados de investigación de tendencias
CREATE TABLE public.client_trend_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.content_profiles(id) ON DELETE CASCADE,
  cycle_id uuid REFERENCES public.content_cycles(id) ON DELETE SET NULL,
  keyword text NOT NULL,
  title text,
  url text,
  source_type text DEFAULT 'web', -- 'web' | 'social' | 'news'
  summary text,
  relevance_score numeric DEFAULT 0,
  raw_data jsonb DEFAULT '{}'::jsonb,
  searched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.client_trend_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_trend_results ENABLE ROW LEVEL SECURITY;

-- Keywords policies
CREATE POLICY "Authenticated can read trend keywords" ON public.client_trend_keywords FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert trend keywords" ON public.client_trend_keywords FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update trend keywords" ON public.client_trend_keywords FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete trend keywords" ON public.client_trend_keywords FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins manage trend keywords" ON public.client_trend_keywords FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Results policies
CREATE POLICY "Authenticated can read trend results" ON public.client_trend_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert trend results" ON public.client_trend_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete trend results" ON public.client_trend_results FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins manage trend results" ON public.client_trend_results FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
