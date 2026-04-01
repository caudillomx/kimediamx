ALTER TABLE public.brand_kit_profiles
  ADD COLUMN IF NOT EXISTS content_pillars jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reference_accounts text,
  ADD COLUMN IF NOT EXISTS content_restrictions text,
  ADD COLUMN IF NOT EXISTS key_dates text,
  ADD COLUMN IF NOT EXISTS preferred_formats jsonb DEFAULT '[]'::jsonb;