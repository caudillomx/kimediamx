
-- 1) Enrich listening entries
ALTER TABLE public.client_portal_listening_entries
  ADD COLUMN IF NOT EXISTS sentiment text,
  ADD COLUMN IF NOT EXISTS sentiment_score numeric,
  ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS mentions jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS urgency text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS actors text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_cple_client_date ON public.client_portal_listening_entries(client_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_cple_sentiment ON public.client_portal_listening_entries(client_id, sentiment);
CREATE INDEX IF NOT EXISTS idx_cple_analyzed ON public.client_portal_listening_entries(client_id, analyzed_at);

-- 2) Weekly narrative analyses
CREATE TABLE IF NOT EXISTS public.client_portal_listening_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  entries_count integer NOT NULL DEFAULT 0,
  executive_summary text,
  key_findings jsonb DEFAULT '[]'::jsonb,
  alerts jsonb DEFAULT '[]'::jsonb,
  recommendations_team text,
  recommendations_client text,
  sentiment_breakdown jsonb DEFAULT '{}'::jsonb,
  top_topics jsonb DEFAULT '[]'::jsonb,
  top_mentions jsonb DEFAULT '[]'::jsonb,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_listening_analyses TO authenticated;
GRANT ALL ON public.client_portal_listening_analyses TO service_role;

ALTER TABLE public.client_portal_listening_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage listening analyses"
  ON public.client_portal_listening_analyses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Client viewers can read listening analyses"
  ON public.client_portal_listening_analyses FOR SELECT
  TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TRIGGER trg_cpla_updated_at
  BEFORE UPDATE ON public.client_portal_listening_analyses
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();
