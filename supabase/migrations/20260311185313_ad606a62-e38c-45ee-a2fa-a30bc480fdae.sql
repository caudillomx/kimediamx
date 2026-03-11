CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  client_name text NOT NULL,
  interaction_type text NOT NULL DEFAULT 'llamada',
  subject text NOT NULL,
  notes text,
  outcome text,
  follow_up_date date,
  follow_up_done boolean NOT NULL DEFAULT false,
  logged_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interactions"
  ON public.interactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert interactions"
  ON public.interactions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update interactions"
  ON public.interactions FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION update_action_items_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.interactions;