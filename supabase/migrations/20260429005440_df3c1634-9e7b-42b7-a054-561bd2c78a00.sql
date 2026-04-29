-- Tabla de participantes individuales por sesión de dependencia
CREATE TABLE public.gto_participantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sesion_id UUID NOT NULL REFERENCES public.gto_sesiones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  ultimo_paso INTEGER NOT NULL DEFAULT 0,
  ultima_actividad TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prompt_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_gto_participantes_sesion ON public.gto_participantes(sesion_id);

ALTER TABLE public.gto_participantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create participantes"
  ON public.gto_participantes FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can read participantes"
  ON public.gto_participantes FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can update participantes"
  ON public.gto_participantes FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage participantes"
  ON public.gto_participantes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Vincular diagnósticos a participante (individuales). Mantenemos sesion_id para agrupar.
ALTER TABLE public.gto_diagnostico_textos
  ADD COLUMN participante_id UUID REFERENCES public.gto_participantes(id) ON DELETE CASCADE,
  ADD COLUMN participante_nombre TEXT;

CREATE INDEX idx_gto_diag_participante ON public.gto_diagnostico_textos(participante_id);