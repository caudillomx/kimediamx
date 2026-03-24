
-- Client objectives table
CREATE TABLE public.client_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 3,
  objective_text TEXT NOT NULL,
  main_activities TEXT,
  business_unit TEXT,
  year INTEGER NOT NULL DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly milestones per objective
CREATE TABLE public.client_weekly_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective_id UUID REFERENCES public.client_objectives(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  activity_text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.client_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_weekly_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read objectives" ON public.client_objectives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage objectives" ON public.client_objectives FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read milestones" ON public.client_weekly_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage milestones" ON public.client_weekly_milestones FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can update milestones" ON public.client_weekly_milestones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
