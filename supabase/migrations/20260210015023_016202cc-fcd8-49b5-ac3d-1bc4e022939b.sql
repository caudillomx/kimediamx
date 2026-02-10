
-- Table for personal branding kit profiles
CREATE TABLE public.brand_kit_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  industry TEXT,
  social_handle TEXT NOT NULL,
  main_channel TEXT,
  approx_followers TEXT,
  has_website BOOLEAN DEFAULT false,
  
  -- Diagnostic
  diagnostic_score INTEGER,
  diagnostic_level TEXT,
  publication_frequency TEXT,
  self_perception TEXT,
  goal_90_days TEXT,
  
  -- Identity
  value_proposition TEXT,
  target_audience TEXT,
  differentiator TEXT,
  brand_tone TEXT,
  
  -- Generated content
  bio_text TEXT,
  post_text TEXT,
  post_type TEXT,
  post_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Consent
  consent_email BOOLEAN NOT NULL DEFAULT false,
  consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  
  -- Profile token for micrositio
  profile_token TEXT DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_kit_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can create a profile (no auth required - lead capture)
CREATE POLICY "Anyone can create brand profile"
ON public.brand_kit_profiles
FOR INSERT
WITH CHECK (true);

-- Anyone can update brand profile (wizard flow updates by id)
CREATE POLICY "Anyone can update brand profile"
ON public.brand_kit_profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Anyone can read brand profiles (micrositio público por token)
CREATE POLICY "Anyone can read brand profiles"
ON public.brand_kit_profiles
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_brand_kit_profiles_updated_at
BEFORE UPDATE ON public.brand_kit_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_participants_updated_at();
