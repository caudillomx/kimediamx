
-- Tabla de registros al webinar
CREATE TABLE public.webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento text NOT NULL DEFAULT 'reto-influenser-2026',
  nombre text NOT NULL,
  email text NOT NULL,
  redes text,
  fuente text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webinar_reg_email ON public.webinar_registrations(email);
CREATE INDEX idx_webinar_reg_evento ON public.webinar_registrations(evento);

ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register"
ON public.webinar_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view registrations"
ON public.webinar_registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabla de outputs del Reel Coach (herramienta interactiva)
CREATE TABLE public.webinar_coach_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.webinar_registrations(id) ON DELETE SET NULL,
  evento text NOT NULL DEFAULT 'reto-influenser-2026',
  causa_social text NOT NULL,
  estilo text,
  audiencia text,
  mensaje_clave text,
  output jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coach_outputs_reg ON public.webinar_coach_outputs(registration_id);

ALTER TABLE public.webinar_coach_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can save coach outputs"
ON public.webinar_coach_outputs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view coach outputs"
ON public.webinar_coach_outputs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
