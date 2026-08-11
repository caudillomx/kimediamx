ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'executive';

CREATE TABLE public.client_portal_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  updated_on date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Mexico_City')::date,
  press_data_through date,
  social_data_through date,
  narratives_data_through date,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_updates TO authenticated;
GRANT ALL ON public.client_portal_updates TO service_role;

ALTER TABLE public.client_portal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users can read portal updates"
ON public.client_portal_updates FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_client_access(auth.uid(), client_id));

CREATE POLICY "Admins manage portal updates"
ON public.client_portal_updates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_cpu_updated
BEFORE UPDATE ON public.client_portal_updates
FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

CREATE INDEX idx_cpu_client_date ON public.client_portal_updates (client_id, updated_on DESC);