CREATE TABLE public.client_portal_dep_recommendations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  dependencia_id uuid not null,
  range_start date not null,
  range_end date not null,
  enfoque text not null,
  payload jsonb not null,
  model text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, dependencia_id, range_start, range_end, enfoque)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_dep_recommendations TO authenticated;
GRANT ALL ON public.client_portal_dep_recommendations TO service_role;

ALTER TABLE public.client_portal_dep_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors manage client_portal_dep_recommendations"
  ON public.client_portal_dep_recommendations FOR ALL TO authenticated
  USING (has_ops_write(auth.uid())) WITH CHECK (has_ops_write(auth.uid()));

CREATE POLICY "Viewers read client_portal_dep_recommendations"
  ON public.client_portal_dep_recommendations FOR SELECT TO authenticated
  USING (has_ops_read(auth.uid()));

CREATE POLICY "dep_recommendations_client_access"
  ON public.client_portal_dep_recommendations FOR ALL TO authenticated
  USING (has_client_access(auth.uid(), client_id))
  WITH CHECK (has_client_access(auth.uid(), client_id));