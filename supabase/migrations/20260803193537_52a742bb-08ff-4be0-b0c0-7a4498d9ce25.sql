CREATE TABLE public.client_portal_dependencias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  nombre_corto text,
  tipo text NOT NULL DEFAULT 'secretaria',
  titular text,
  titular_cargo text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_dependencias TO authenticated;
GRANT ALL ON public.client_portal_dependencias TO service_role;

ALTER TABLE public.client_portal_dependencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan dependencias"
  ON public.client_portal_dependencias FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Portal cliente lee dependencias"
  ON public.client_portal_dependencias FOR SELECT
  TO authenticated
  USING (public.has_client_access(auth.uid(), client_id));

CREATE TRIGGER trg_cpdep_updated
  BEFORE UPDATE ON public.client_portal_dependencias
  FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

CREATE UNIQUE INDEX ux_cpdep_client_nombre
  ON public.client_portal_dependencias (client_id, lower(nombre));

ALTER TABLE public.client_portal_benchmark_competitors
  ADD COLUMN dependencia_id uuid REFERENCES public.client_portal_dependencias(id) ON DELETE SET NULL,
  ADD COLUMN account_type text;

CREATE INDEX idx_bench_competitors_dependencia
  ON public.client_portal_benchmark_competitors (dependencia_id);