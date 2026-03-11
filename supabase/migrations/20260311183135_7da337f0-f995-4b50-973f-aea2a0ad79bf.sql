
-- Pipeline / Deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_name text NOT NULL,
  contact_name text,
  description text,
  estimated_value numeric(12,2),
  stage text NOT NULL DEFAULT 'prospecto',
  estimated_start_date date,
  closed_date date,
  responsible_id uuid REFERENCES public.team_members(id),
  responsible_name text,
  notes text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage deals" ON public.deals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read deals" ON public.deals
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update deals" ON public.deals
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_action_items_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
