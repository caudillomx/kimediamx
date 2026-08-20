CREATE TABLE public.client_portal_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  stage text not null default 'awareness',
  name text not null,
  channel text,
  url text,
  status text not null default 'activo',
  owner text,
  metric_label text,
  metric_value text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_assets TO authenticated;
GRANT ALL ON public.client_portal_assets TO service_role;

ALTER TABLE public.client_portal_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets viewable by client members or admins"
ON public.client_portal_assets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_client_access(auth.uid(), client_id));

CREATE POLICY "assets manageable by admins"
ON public.client_portal_assets FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_client_portal_assets_updated
BEFORE UPDATE ON public.client_portal_assets
FOR EACH ROW EXECUTE FUNCTION public.tg_portal_touch_updated_at();

CREATE INDEX idx_cpa_client ON public.client_portal_assets(client_id, stage, sort_order);