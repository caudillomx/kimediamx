ALTER TABLE public.client_weekly_status
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual','ia_sugerido'));

CREATE INDEX IF NOT EXISTS idx_client_weekly_status_source
  ON public.client_weekly_status(source);