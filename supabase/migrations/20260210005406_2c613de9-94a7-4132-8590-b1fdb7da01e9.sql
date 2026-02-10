
-- Add institutional columns to participants
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS institutional_role text,
  ADD COLUMN IF NOT EXISTS responsibility_level text,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS org_causes text[],
  ADD COLUMN IF NOT EXISTS strategic_audience text,
  ADD COLUMN IF NOT EXISTS institutional_card text,
  ADD COLUMN IF NOT EXISTS spokesperson_phrase text,
  ADD COLUMN IF NOT EXISTS spokesperson_tone text,
  ADD COLUMN IF NOT EXISTS quarterly_topics text[],
  ADD COLUMN IF NOT EXISTS sensitive_topics text[],
  ADD COLUMN IF NOT EXISTS spokesperson_guide jsonb,
  ADD COLUMN IF NOT EXISTS bio_institutional text,
  ADD COLUMN IF NOT EXISTS bio_hybrid text,
  ADD COLUMN IF NOT EXISTS institutional_post_type text,
  ADD COLUMN IF NOT EXISTS institutional_post_text text,
  ADD COLUMN IF NOT EXISTS institutional_post_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kit_downloaded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS route_activated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_token text DEFAULT encode(gen_random_bytes(16), 'hex');

-- Create route_progress table
CREATE TABLE public.route_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  week_number integer NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  completed boolean NOT NULL DEFAULT false,
  post_text text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(participant_id, week_number)
);

ALTER TABLE public.route_progress ENABLE ROW LEVEL SECURITY;

-- Anyone can insert their own progress
CREATE POLICY "Anyone can insert route progress"
  ON public.route_progress FOR INSERT
  WITH CHECK (true);

-- Anyone can update route progress
CREATE POLICY "Anyone can update route progress"
  ON public.route_progress FOR UPDATE
  USING (true) WITH CHECK (true);

-- Anyone can read route progress
CREATE POLICY "Anyone can read route progress"
  ON public.route_progress FOR SELECT
  USING (true);

-- Admins can manage all
CREATE POLICY "Admins can manage route progress"
  ON public.route_progress FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- App settings table for community link etc.
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON public.app_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default community link
INSERT INTO public.app_settings (key, value) VALUES ('community_link', '');

-- Set profile_token default for existing rows
UPDATE public.participants SET profile_token = encode(gen_random_bytes(16), 'hex') WHERE profile_token IS NULL;
