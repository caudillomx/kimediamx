
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  aliases text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage clients" ON public.clients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated read clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

INSERT INTO public.clients (name, is_active)
SELECT DISTINCT name, true FROM (
  SELECT client AS name FROM public.action_items WHERE client IS NOT NULL AND client <> ''
  UNION
  SELECT client_name FROM public.client_contacts
  UNION
  SELECT client_name FROM public.content_profiles
) s
WHERE name IS NOT NULL
ON CONFLICT (name) DO NOTHING;
