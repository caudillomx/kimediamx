
-- Add brand_essence and client_type to content_profiles
ALTER TABLE public.content_profiles ADD COLUMN IF NOT EXISTS brand_essence text;
ALTER TABLE public.content_profiles ADD COLUMN IF NOT EXISTS client_type text DEFAULT 'calendarizado';
-- Change brand_tone to support multiple tones (store as comma-separated, keep backward compat)
-- We'll handle multi-tone in the UI by storing "Profesional, Educativo" format

-- Add ads_budget and special_dates to content_cycles  
ALTER TABLE public.content_cycles ADD COLUMN IF NOT EXISTS ads_budget numeric DEFAULT 0;
