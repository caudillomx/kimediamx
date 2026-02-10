
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS consent_whatsapp boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_email boolean NOT NULL DEFAULT false;
