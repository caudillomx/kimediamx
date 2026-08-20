
CREATE TABLE public.notion_parrilla_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_database_id text NOT NULL UNIQUE,
  label text NOT NULL,
  multi_client boolean NOT NULL DEFAULT false,
  default_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  account_map jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notion_parrilla_sources TO authenticated;
GRANT ALL ON public.notion_parrilla_sources TO service_role;
ALTER TABLE public.notion_parrilla_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notion sources manageable by admins" ON public.notion_parrilla_sources
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.notion_parrilla_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.notion_parrilla_sources(id) ON DELETE CASCADE,
  notion_page_id text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  account text,
  title text,
  scheduled_date date,
  theme text,
  objective text,
  format text,
  network text,
  status text,
  responsible text,
  notion_url text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notion_items_client_date ON public.notion_parrilla_items (client_id, scheduled_date);

GRANT SELECT ON public.notion_parrilla_items TO authenticated;
GRANT ALL ON public.notion_parrilla_items TO service_role;
ALTER TABLE public.notion_parrilla_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notion items manageable by admins" ON public.notion_parrilla_items
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "notion items viewable by client members" ON public.notion_parrilla_items
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_client_access(auth.uid(), client_id));

INSERT INTO public.notion_parrilla_sources (notion_database_id, label, multi_client, default_client_id, account_map) VALUES
 ('3a360b3f-7897-8011-9868-d9d9e9610159','Calendario Kimedia Agosto', true, NULL,
   '{"padre sada":"e982a96c-123f-43f7-b8b0-cf788c2980ab","kimedia":"2dc402e4-dedc-47f7-a3c3-ab7aa7f575a5","fimeme":"77d1b8d6-2d27-4b3c-8d6b-8465e3595701","falcon":"63fac67f-50e9-4086-8258-5f0d8a49d341","el diluvio":"8e48b515-2b96-4d19-aed8-f11bb17cfa83","mario doria":"21c1595b-988f-47d0-bd97-02021aaf7147"}'::jsonb),
 ('3c160b3f-7897-80f1-b44d-cd9836fa37d2','Calendario Kimedia Septiembre', true, NULL,
   '{"padre sada":"e982a96c-123f-43f7-b8b0-cf788c2980ab","kimedia":"2dc402e4-dedc-47f7-a3c3-ab7aa7f575a5","fimeme":"77d1b8d6-2d27-4b3c-8d6b-8465e3595701","falcon":"63fac67f-50e9-4086-8258-5f0d8a49d341","el diluvio":"8e48b515-2b96-4d19-aed8-f11bb17cfa83","mario doria":"21c1595b-988f-47d0-bd97-02021aaf7147"}'::jsonb),
 ('39c60b3f-7897-8039-9335-d6dc7ef97c5d','Falcon Agosto', false, '63fac67f-50e9-4086-8258-5f0d8a49d341','{}'::jsonb),
 ('3b360b3f-7897-8008-bd44-ef501cac8464','Falcon Septiembre', false, '63fac67f-50e9-4086-8258-5f0d8a49d341','{}'::jsonb),
 ('3a660b3f-7897-8058-a387-f7b9091a2b6f','El Diluvio · Número 13', false, '8e48b515-2b96-4d19-aed8-f11bb17cfa83','{}'::jsonb),
 ('36860b3f-7897-8066-811f-f536b8e26281','Strategos', false, '7369630f-9706-430a-a80a-6b35437acb40','{}'::jsonb),
 ('35760b3f-7897-8076-b029-f59782964a98','Ricardo Robles', false, '1b33fa9c-c5c0-489b-9dd6-1085d2521ca0','{}'::jsonb);
