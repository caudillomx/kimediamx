ALTER TABLE public.observatory_signals ADD COLUMN IF NOT EXISTS content_plan jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE public.observatory_monitor_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), vertical_slug text NOT NULL REFERENCES public.observatory_verticals(slug), started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, status text NOT NULL DEFAULT 'running', signals_saved integer NOT NULL DEFAULT 0, sources_found integer NOT NULL DEFAULT 0, message text);
GRANT SELECT ON public.observatory_monitor_runs TO anon, authenticated;
GRANT ALL ON public.observatory_monitor_runs TO service_role;
ALTER TABLE public.observatory_monitor_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public monitoring status" ON public.observatory_monitor_runs FOR SELECT TO anon,authenticated USING (true);
CREATE INDEX observatory_monitor_runs_latest ON public.observatory_monitor_runs(vertical_slug,started_at DESC);
CREATE INDEX observatory_signals_recent ON public.observatory_signals(published_at DESC);