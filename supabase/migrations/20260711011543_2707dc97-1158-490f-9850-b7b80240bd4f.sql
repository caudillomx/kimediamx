
CREATE TABLE public.client_portal_benchmark_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  handle TEXT,
  platform TEXT NOT NULL DEFAULT 'multi',
  brand_color TEXT NOT NULL DEFAULT '#94a3b8',
  is_default BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ux_benchmark_competitors_client_name
  ON public.client_portal_benchmark_competitors (client_id, lower(name));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_competitors TO authenticated;
GRANT ALL ON public.client_portal_benchmark_competitors TO service_role;
ALTER TABLE public.client_portal_benchmark_competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan competidores" ON public.client_portal_benchmark_competitors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Portal cliente lee competidores" ON public.client_portal_benchmark_competitors
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TABLE public.client_portal_benchmark_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  uploaded_file_name TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_weeks TO authenticated;
GRANT ALL ON public.client_portal_benchmark_weeks TO service_role;
ALTER TABLE public.client_portal_benchmark_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan semanas benchmark" ON public.client_portal_benchmark_weeks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Portal cliente lee semanas benchmark" ON public.client_portal_benchmark_weeks
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TABLE public.client_portal_benchmark_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES public.client_portal_benchmark_weeks(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.client_portal_benchmark_competitors(id) ON DELETE CASCADE,
  is_self BOOLEAN NOT NULL DEFAULT false,
  brand_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'multi',
  fans NUMERIC,
  fan_change NUMERIC,
  followers NUMERIC,
  posts NUMERIC,
  interactions NUMERIC,
  engagement_rate NUMERIC,
  reach NUMERIC,
  video_views NUMERIC,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_benchmark_metrics_week ON public.client_portal_benchmark_metrics(week_id);
CREATE INDEX idx_benchmark_metrics_client ON public.client_portal_benchmark_metrics(client_id, is_self);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_benchmark_metrics TO authenticated;
GRANT ALL ON public.client_portal_benchmark_metrics TO service_role;
ALTER TABLE public.client_portal_benchmark_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan metricas benchmark" ON public.client_portal_benchmark_metrics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Portal cliente lee metricas benchmark" ON public.client_portal_benchmark_metrics
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TRIGGER trg_benchmark_competitors_updated
  BEFORE UPDATE ON public.client_portal_benchmark_competitors
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
CREATE TRIGGER trg_benchmark_weeks_updated
  BEFORE UPDATE ON public.client_portal_benchmark_weeks
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
CREATE TRIGGER trg_benchmark_metrics_updated
  BEFORE UPDATE ON public.client_portal_benchmark_metrics
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
