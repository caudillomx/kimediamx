-- ============================================================
-- Curso interno: Configuración de IA por dependencia (GTO)
-- ============================================================

-- 1. Catálogo de dependencias
CREATE TABLE public.gto_dependencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  siglas text NOT NULL UNIQUE,
  access_code text NOT NULL UNIQUE,
  contacto_enlace text,
  contacto_email text,
  contacto_telefono text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gto_dependencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dependencias"
  ON public.gto_dependencias FOR SELECT
  USING (true);

CREATE POLICY "Admins manage dependencias"
  ON public.gto_dependencias FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Sesiones del curso (una por dependencia)
CREATE TABLE public.gto_sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dependencia_id uuid NOT NULL REFERENCES public.gto_dependencias(id) ON DELETE CASCADE,
  -- Datos del titular y herramienta
  titular_nombre text,
  titular_cargo text,
  herramienta_ia text, -- chatgpt | claude | copilot | gemini | otra
  -- Brief institucional (Paso 1, las 6 preguntas)
  brief_mision text,
  brief_audiencias jsonb DEFAULT '[]'::jsonb,
  brief_tono text,
  brief_terminos_prohibidos jsonb DEFAULT '[]'::jsonb,
  brief_terminos_preferidos jsonb DEFAULT '[]'::jsonb,
  brief_mensajes_clave jsonb DEFAULT '[]'::jsonb,
  brief_tipo_texto text,
  -- Corpus (Paso 2)
  corpus_documentos jsonb DEFAULT '[]'::jsonb, -- [{tipo, nombre, prioridad, subido}]
  corpus_notas text,
  -- Prompt de sistema generado (Paso 3)
  prompt_sistema text,
  prompt_generado_at timestamptz,
  -- Compromisos (Paso 4)
  compromiso_corpus_subido boolean NOT NULL DEFAULT false,
  compromiso_prompt_probado boolean NOT NULL DEFAULT false,
  compromiso_resultado_compartido boolean NOT NULL DEFAULT false,
  -- Estado y metadatos
  estado text NOT NULL DEFAULT 'pendiente', -- pendiente | en_curso | completada
  paso_actual integer NOT NULL DEFAULT 0,
  notas_kimedia text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(dependencia_id)
);

ALTER TABLE public.gto_sesiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sesiones"
  ON public.gto_sesiones FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sesiones"
  ON public.gto_sesiones FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sesiones"
  ON public.gto_sesiones FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins manage sesiones"
  ON public.gto_sesiones FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER gto_sesiones_updated_at
  BEFORE UPDATE ON public.gto_sesiones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_action_items_updated_at();

-- 3. Diagnóstico de textos (pre-trabajo)
CREATE TABLE public.gto_diagnostico_textos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id uuid NOT NULL REFERENCES public.gto_sesiones(id) ON DELETE CASCADE,
  titulo text,
  texto_original text NOT NULL,
  -- Análisis de la IA
  errores_detectados jsonb DEFAULT '[]'::jsonb, -- [{tipo, ejemplo, sugerencia}]
  resumen_diagnostico text,
  score_calidad integer, -- 1-10
  analizado_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gto_diagnostico_textos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read diagnosticos"
  ON public.gto_diagnostico_textos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create diagnosticos"
  ON public.gto_diagnostico_textos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update diagnosticos"
  ON public.gto_diagnostico_textos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins manage diagnosticos"
  ON public.gto_diagnostico_textos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_gto_diagnosticos_sesion ON public.gto_diagnostico_textos(sesion_id);
CREATE INDEX idx_gto_sesiones_dependencia ON public.gto_sesiones(dependencia_id);

-- ============================================================
-- Semilla: 20 dependencias con código de acceso SIGLAS-2026
-- ============================================================
INSERT INTO public.gto_dependencias (nombre, siglas, access_code, sort_order) VALUES
  ('Comisión de Deporte del Estado de Guanajuato', 'CODE', 'CODE-2026', 1),
  ('Coordinación General de Comunicación Social', 'CGCS', 'CGCS-2026', 2),
  ('Financiera y Apoyos Tú Puedes Guanajuato', 'TUPUEDES', 'TUPUEDES-2026', 3),
  ('Instituto de Seguridad Social del Estado de Guanajuato', 'ISSEG', 'ISSEG-2026', 4),
  ('Instituto para el desarrollo y atención a las Juventudes', 'JUVENTUDES', 'JUVENTUDES-2026', 5),
  ('Secretaría de Derechos Humanos', 'SDH', 'SDH-2026', 6),
  ('Secretaría de Economía', 'SE', 'SE-2026', 7),
  ('Secretaría de Educación de Guanajuato', 'SEG', 'SEG-2026', 8),
  ('Secretaría de Gobierno', 'SG', 'SG-2026', 9),
  ('Secretaría de la Honestidad', 'SH', 'SH-2026', 10),
  ('Secretaría de las Mujeres', 'MUJERES', 'MUJERES-2026', 11),
  ('Secretaría de Obra Pública', 'SOP', 'SOP-2026', 12),
  ('Secretaría de Salud de Guanajuato', 'SSG', 'SSG-2026', 13),
  ('Secretaría de Seguridad y Paz', 'SSP', 'SSP-2026', 14),
  ('Secretaría de Turismo e Identidad', 'SECTUR', 'SECTUR-2026', 15),
  ('Secretaría del Agua y Medio Ambiente', 'SAMA', 'SAMA-2026', 16),
  ('Secretaría del Campo', 'CAMPO', 'CAMPO-2026', 17),
  ('Secretaría del Nuevo Comienzo', 'SENCO', 'SENCO-2026', 18),
  ('Sistema para el Desarrollo Integral de la Familia de Estado de Guanajuato', 'DIF', 'DIF-2026', 19),
  ('Unidad de Televisión de Guanajuato', 'TV4', 'TV4-2026', 20);