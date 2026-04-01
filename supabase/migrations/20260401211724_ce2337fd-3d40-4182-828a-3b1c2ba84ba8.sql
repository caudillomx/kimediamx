ALTER TABLE public.content_profiles ADD COLUMN IF NOT EXISTS reference_accounts text DEFAULT null;
ALTER TABLE public.content_profiles ADD COLUMN IF NOT EXISTS website_url text DEFAULT null;