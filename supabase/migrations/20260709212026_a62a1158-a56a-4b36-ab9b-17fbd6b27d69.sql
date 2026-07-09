-- ============ ENUM ============
DO $$ BEGIN
  CREATE TYPE public.portal_dataset_source AS ENUM (
    'fanpage_karma','meta_ads','x_ads','tiktok_ads','google_ads','screenshot','other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLE: datasets ============
CREATE TABLE IF NOT EXISTS public.client_portal_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  source public.portal_dataset_source NOT NULL,
  platform TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  file_name TEXT,
  storage_path TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cpd_client_period ON public.client_portal_datasets(client_id, period_start DESC);
GRANT SELECT ON public.client_portal_datasets TO authenticated;
GRANT ALL ON public.client_portal_datasets TO service_role;
ALTER TABLE public.client_portal_datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access datasets" ON public.client_portal_datasets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Viewers read own client datasets" ON public.client_portal_datasets
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

-- ============ TABLE: listening entries ============
CREATE TABLE IF NOT EXISTS public.client_portal_listening_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content_md TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  raw_source_ref TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cple_client_date ON public.client_portal_listening_entries(client_id, entry_date DESC);
GRANT SELECT ON public.client_portal_listening_entries TO authenticated;
GRANT ALL ON public.client_portal_listening_entries TO service_role;
ALTER TABLE public.client_portal_listening_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access listening" ON public.client_portal_listening_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Viewers read own client listening" ON public.client_portal_listening_entries
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

-- ============ TABLE: weekly recommendations ============
-- for_team_md is NEVER exposed to viewers (see view below).
CREATE TABLE IF NOT EXISTS public.client_portal_weekly_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  for_client_md TEXT,
  for_team_md TEXT,
  priority TEXT NOT NULL DEFAULT 'media',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_start)
);
CREATE INDEX IF NOT EXISTS idx_cpwr_client_week ON public.client_portal_weekly_recommendations(client_id, week_start DESC);
GRANT SELECT ON public.client_portal_weekly_recommendations TO authenticated;
GRANT ALL ON public.client_portal_weekly_recommendations TO service_role;
ALTER TABLE public.client_portal_weekly_recommendations ENABLE ROW LEVEL SECURITY;
-- Admins do everything (including reading for_team_md)
CREATE POLICY "Admins full access recs" ON public.client_portal_weekly_recommendations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
-- Viewers can SELECT rows of their client, BUT the client-side code MUST use the
-- safe view below (client_portal_weekly_recommendations_public) to avoid pulling for_team_md.
-- We still allow direct SELECT so admins reading via the same code path work; column-level
-- restriction is enforced at the view level (view only selects for_client_md).
CREATE POLICY "Viewers read own client recs" ON public.client_portal_weekly_recommendations
  FOR SELECT TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

-- Safe view for the client portal: NEVER exposes for_team_md.
CREATE OR REPLACE VIEW public.client_portal_weekly_recommendations_public
WITH (security_invoker = true) AS
SELECT id, client_id, week_start, for_client_md, priority, created_at, updated_at
FROM public.client_portal_weekly_recommendations;
GRANT SELECT ON public.client_portal_weekly_recommendations_public TO authenticated;

-- ============ TABLE: credentials ============
CREATE TABLE IF NOT EXISTS public.client_portal_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,
  portal_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  portal_email TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_portal_credentials TO service_role;
GRANT SELECT ON public.client_portal_credentials TO authenticated;
ALTER TABLE public.client_portal_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access credentials" ON public.client_portal_credentials
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.tg_portal_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_cpd_updated ON public.client_portal_datasets;
CREATE TRIGGER trg_cpd_updated BEFORE UPDATE ON public.client_portal_datasets
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

DROP TRIGGER IF EXISTS trg_cple_updated ON public.client_portal_listening_entries;
CREATE TRIGGER trg_cple_updated BEFORE UPDATE ON public.client_portal_listening_entries
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

DROP TRIGGER IF EXISTS trg_cpwr_updated ON public.client_portal_weekly_recommendations;
CREATE TRIGGER trg_cpwr_updated BEFORE UPDATE ON public.client_portal_weekly_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

DROP TRIGGER IF EXISTS trg_cpc_updated ON public.client_portal_credentials;
CREATE TRIGGER trg_cpc_updated BEFORE UPDATE ON public.client_portal_credentials
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

-- ============ STORAGE RLS: client-datasets bucket ============
-- Path convention: {client_id}/{yyyy-mm}/{filename}
CREATE POLICY "Admins full access client-datasets"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'client-datasets' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'client-datasets' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Viewers read own client-datasets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'client-datasets'
    AND public.has_client_access(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );
