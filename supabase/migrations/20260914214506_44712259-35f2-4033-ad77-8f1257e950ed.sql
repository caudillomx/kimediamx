CREATE TABLE IF NOT EXISTS public.client_ga4_properties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  label text,
  active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  last_sync_error text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, property_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_ga4_properties TO authenticated;
GRANT ALL ON public.client_ga4_properties TO service_role;

ALTER TABLE public.client_ga4_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ops can manage ga4 properties" ON public.client_ga4_properties;
CREATE POLICY "Ops can manage ga4 properties"
ON public.client_ga4_properties FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

DROP TRIGGER IF EXISTS update_client_ga4_properties_updated_at ON public.client_ga4_properties;
CREATE TRIGGER update_client_ga4_properties_updated_at
BEFORE UPDATE ON public.client_ga4_properties
FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();