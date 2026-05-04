-- Tabla principal: bandeja de reuniones de Fireflies
CREATE TABLE public.fireflies_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fireflies_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ,
  duration_seconds INTEGER,
  host_email TEXT,
  organizer_email TEXT,
  participants TEXT[] DEFAULT '{}',
  transcript_url TEXT,
  summary_overview TEXT,
  summary_short TEXT,
  -- Estado de la bandeja
  review_status TEXT NOT NULL DEFAULT 'needs_review', -- needs_review | approved | excluded | imported
  exclusion_reason TEXT, -- 'host_not_whitelisted' | 'keyword_blacklisted' | 'too_short' | 'manual' | 'sensitive'
  matched_rule_id UUID,
  suggested_client TEXT,
  assigned_client TEXT,
  imported_minute_id UUID,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fireflies_meetings_status ON public.fireflies_meetings(review_status);
CREATE INDEX idx_fireflies_meetings_date ON public.fireflies_meetings(meeting_date DESC);

ALTER TABLE public.fireflies_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fireflies meetings"
ON public.fireflies_meetings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_fireflies_meetings_updated
BEFORE UPDATE ON public.fireflies_meetings
FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- Tabla de reglas de filtrado
CREATE TABLE public.fireflies_filter_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_type TEXT NOT NULL, -- 'host_whitelist' | 'title_blacklist' | 'client_mapping' | 'min_duration'
  pattern TEXT NOT NULL, -- email/domain, keyword, regex, or value
  client_name TEXT, -- only for client_mapping
  match_field TEXT, -- 'title' | 'participant_email' (for client_mapping)
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fireflies_rules_active ON public.fireflies_filter_rules(rule_type, is_active);

ALTER TABLE public.fireflies_filter_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage filter rules"
ON public.fireflies_filter_rules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enlazar minuta importada con su origen Fireflies
ALTER TABLE public.minutes
ADD COLUMN IF NOT EXISTS fireflies_meeting_id UUID REFERENCES public.fireflies_meetings(id) ON DELETE SET NULL;

-- Reglas iniciales razonables
INSERT INTO public.fireflies_filter_rules (rule_type, pattern, notes) VALUES
  ('host_whitelist', '@kimedia.mx', 'Dominio principal del equipo KiMedia'),
  ('title_blacklist', '1:1', 'Reuniones uno a uno son privadas por defecto'),
  ('title_blacklist', 'rh', 'Temas de Recursos Humanos'),
  ('title_blacklist', 'nómina', 'Información sensible de pagos'),
  ('title_blacklist', 'confidencial', 'Marcado explícitamente como privado'),
  ('title_blacklist', 'personal', 'Reuniones personales'),
  ('min_duration', '300', 'Descartar reuniones menores a 5 minutos (segundos)');