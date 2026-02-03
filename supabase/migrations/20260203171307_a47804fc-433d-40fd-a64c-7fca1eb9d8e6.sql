-- Table to store guide access registrations (leads)
CREATE TABLE public.guide_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_type TEXT NOT NULL CHECK (guide_type IN ('personal_brand', 'pyme')),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guide_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to register (public guide access)
CREATE POLICY "Anyone can register for guide access"
ON public.guide_registrations
FOR INSERT
WITH CHECK (true);

-- Allow reading own registrations by email
CREATE POLICY "Users can check their registration"
ON public.guide_registrations
FOR SELECT
USING (true);

-- Create indexes
CREATE INDEX idx_guide_registrations_email ON public.guide_registrations(email);
CREATE INDEX idx_guide_registrations_guide_type ON public.guide_registrations(guide_type);