
-- Tabla de sesiones de capacitación / consultoría / simulacros
CREATE TABLE public.gto_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dependencia_id UUID NOT NULL,
  sesion_id UUID,
  session_type TEXT NOT NULL DEFAULT 'consultoria',
  -- consultoria | entrenamiento | simulacro
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  modality TEXT DEFAULT 'virtual',
  -- virtual | presencial | hibrido
  attendees JSONB DEFAULT '[]'::jsonb,
  -- [{nombre, cargo}]
  attendee_count INTEGER DEFAULT 0,
  facilitator TEXT,
  topic TEXT,
  objective TEXT,
  -- Fireflies
  fireflies_meeting_id TEXT,
  fireflies_url TEXT,
  transcript_text TEXT,
  transcript_summary TEXT,
  -- IA-extraídos
  ai_extracted JSONB DEFAULT '{}'::jsonb,
  -- {recomendaciones, mensaje_trabajado, tiempos_simulacro, observaciones, competencias_trabajadas}
  ai_extracted_at TIMESTAMP WITH TIME ZONE,
  -- Resultados
  result_type TEXT,
  -- resolucion | claridad_narrativa | respuesta_institucional | otro
  result_description TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gto_training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage training sessions"
  ON public.gto_training_sessions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_gto_training_sessions_dep_date
  ON public.gto_training_sessions (dependencia_id, session_date DESC);

CREATE TRIGGER trg_gto_training_sessions_updated_at
  BEFORE UPDATE ON public.gto_training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- Calificaciones MCN por dependencia/mes
CREATE TABLE public.gto_mcn_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dependencia_id UUID NOT NULL,
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  -- Las 5 dimensiones MCN (escala 0-10)
  deteccion_temprana NUMERIC(4,2),
  analisis_riesgos NUMERIC(4,2),
  coordinacion NUMERIC(4,2),
  tiempo_respuesta NUMERIC(4,2),
  trazabilidad NUMERIC(4,2),
  -- Comentarios cualitativos
  fortalezas TEXT,
  areas_mejora TEXT,
  observaciones JSONB DEFAULT '{}'::jsonb,
  -- {deteccion_temprana: "...", analisis_riesgos: "...", ...}
  computed_by TEXT DEFAULT 'manual',
  -- manual | ai | hybrid
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (dependencia_id, period_year, period_month)
);

ALTER TABLE public.gto_mcn_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage mcn scores"
  ON public.gto_mcn_scores FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_gto_mcn_scores_dep_period
  ON public.gto_mcn_scores (dependencia_id, period_year, period_month);

CREATE TRIGGER trg_gto_mcn_scores_updated_at
  BEFORE UPDATE ON public.gto_mcn_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- Entregables generados (los .docx)
CREATE TABLE public.gto_deliverables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deliverable_type TEXT NOT NULL,
  -- registro_consultorias | resumen_consultorias | reporte_mcn | bitacora_simulacros
  dependencia_id UUID,
  -- Null para reporte global (consolidados)
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'borrador',
  -- borrador | revision | entregado
  consultant_name TEXT,
  generated_content JSONB DEFAULT '{}'::jsonb,
  -- estructura completa antes de exportar a Word
  file_url TEXT,
  file_name TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gto_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage deliverables"
  ON public.gto_deliverables FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_gto_deliverables_period
  ON public.gto_deliverables (period_year, period_month, deliverable_type);

CREATE TRIGGER trg_gto_deliverables_updated_at
  BEFORE UPDATE ON public.gto_deliverables
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- Bucket privado para entregables generados
INSERT INTO storage.buckets (id, name, public)
VALUES ('gto-deliverables', 'gto-deliverables', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins read gto deliverables"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'gto-deliverables' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins write gto deliverables"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gto-deliverables' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update gto deliverables"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gto-deliverables' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete gto deliverables"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gto-deliverables' AND has_role(auth.uid(), 'admin'::app_role));
