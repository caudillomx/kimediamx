
-- Add PyME-specific columns to brand_kit_profiles
ALTER TABLE public.brand_kit_profiles
  ADD COLUMN IF NOT EXISTS kit_type text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS company_size text,
  ADD COLUMN IF NOT EXISTS years_in_business text,
  ADD COLUMN IF NOT EXISTS competitors text,
  ADD COLUMN IF NOT EXISTS market_position text;
