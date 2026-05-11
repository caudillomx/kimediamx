-- 1. Transcripciones de sesión (origen Fireflies)
CREATE TABLE public.gto_sesion_transcripciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL,
  fireflies_id text UNIQUE,
  meeting_date timestamptz,
  titulo text NOT NULL,
  transcript_text text,
  summary_overview text,
  participantes_detectados jsonb DEFAULT '[]'::jsonb,
  temas_cubiertos jsonb DEFAULT '[]'::jsonb,
  citas_clave jsonb DEFAULT '[]'::jsonb,
  agenda_real jsonb DEFAULT '[]'::jsonb,
  duracion_min integer,
  processed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gto_transcripciones_sesion ON public.gto_sesion_transcripciones(sesion_id);
CREATE INDEX idx_gto_transcripciones_date ON public.gto_sesion_transcripciones(meeting_date DESC);

ALTER TABLE public.gto_sesion_transcripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage transcripciones" ON public.gto_sesion_transcripciones
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gto_transcripciones_updated
  BEFORE UPDATE ON public.gto_sesion_transcripciones
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- 2. Memoria de sesión (entregable ejecutivo)
CREATE TABLE public.gto_entregables_sesion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL,
  transcripcion_id uuid,
  dependencia_id uuid,
  contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  pdf_path text,
  status text NOT NULL DEFAULT 'borrador',
  generated_at timestamptz,
  delivered_at timestamptz,
  generated_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gto_entreg_sesion_sesion ON public.gto_entregables_sesion(sesion_id);
CREATE INDEX idx_gto_entreg_sesion_dep ON public.gto_entregables_sesion(dependencia_id);

ALTER TABLE public.gto_entregables_sesion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage entregables sesion" ON public.gto_entregables_sesion
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gto_entreg_sesion_updated
  BEFORE UPDATE ON public.gto_entregables_sesion
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- 3. Kit personal del participante
CREATE TABLE public.gto_entregables_participante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id uuid NOT NULL,
  dependencia_id uuid,
  sesion_ids uuid[] DEFAULT '{}',
  contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  pdf_path text,
  status text NOT NULL DEFAULT 'borrador',
  generated_at timestamptz,
  delivered_at timestamptz,
  generated_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gto_entreg_part_participante ON public.gto_entregables_participante(participante_id);
CREATE INDEX idx_gto_entreg_part_dep ON public.gto_entregables_participante(dependencia_id);

ALTER TABLE public.gto_entregables_participante ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage entregables participante" ON public.gto_entregables_participante
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gto_entreg_part_updated
  BEFORE UPDATE ON public.gto_entregables_participante
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- 4. Reporte mensual por dependencia
CREATE TABLE public.gto_entregables_mensuales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dependencia_id uuid NOT NULL,
  period_year integer NOT NULL,
  period_month integer NOT NULL,
  contenido jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  pdf_path text,
  status text NOT NULL DEFAULT 'borrador',
  generated_at timestamptz,
  delivered_at timestamptz,
  generated_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dependencia_id, period_year, period_month)
);

CREATE INDEX idx_gto_entreg_mens_dep ON public.gto_entregables_mensuales(dependencia_id);

ALTER TABLE public.gto_entregables_mensuales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage entregables mensuales" ON public.gto_entregables_mensuales
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_gto_entreg_mens_updated
  BEFORE UPDATE ON public.gto_entregables_mensuales
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();