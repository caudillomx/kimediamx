CREATE TABLE public.client_portal_listening_analysis_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  result jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.client_portal_listening_analysis_jobs TO authenticated;
GRANT ALL ON public.client_portal_listening_analysis_jobs TO service_role;

ALTER TABLE public.client_portal_listening_analysis_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage listening analysis jobs"
  ON public.client_portal_listening_analysis_jobs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Client viewers can read listening analysis jobs"
  ON public.client_portal_listening_analysis_jobs FOR SELECT
  TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE INDEX idx_cplaj_client_period ON public.client_portal_listening_analysis_jobs(client_id, period_start, period_end, created_at DESC);
CREATE INDEX idx_cplaj_status ON public.client_portal_listening_analysis_jobs(status, created_at DESC);

DROP TRIGGER IF EXISTS trg_cplaj_updated ON public.client_portal_listening_analysis_jobs;
CREATE TRIGGER trg_cplaj_updated
  BEFORE UPDATE ON public.client_portal_listening_analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_portal_touch_updated_at();