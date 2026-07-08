ALTER TABLE public.client_objectives
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

UPDATE public.client_objectives co
SET client_id = c.id
FROM public.clients c
WHERE co.client_id IS NULL
  AND LOWER(TRIM(co.client_name)) = LOWER(TRIM(c.name));

CREATE INDEX IF NOT EXISTS idx_client_objectives_client_id ON public.client_objectives(client_id);

CREATE TABLE public.client_weekly_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  week_start date NOT NULL,
  semaforo text NOT NULL DEFAULT 'verde' CHECK (semaforo IN ('verde','amarillo','rojo')),
  proximo_hito text,
  riesgo_activo text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_start)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_weekly_status TO authenticated;
GRANT ALL ON public.client_weekly_status TO service_role;

ALTER TABLE public.client_weekly_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read weekly status" ON public.client_weekly_status
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated update weekly status" ON public.client_weekly_status
  FOR ALL TO authenticated USING (true) WITH CHECK (true);