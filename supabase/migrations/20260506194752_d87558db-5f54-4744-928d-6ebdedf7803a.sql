
-- Extend clients table with canonical fields
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'activo',
  ADD COLUMN IF NOT EXISTS is_probono BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Seed any missing names from the historical hardcoded list
INSERT INTO public.clients (name) VALUES
  ('Guanajuato'),('Actinver'),('El Diluvio'),('Padre Sada'),
  ('Mario Doria - Urólogo'),('MID Clinic'),('FIMEME'),('KiMedia'),
  ('Memeverso'),('Mundo Empresarial'),('Lidérate'),('Strategos')
ON CONFLICT (name) DO NOTHING;

-- Add client_id to content_profiles (action_items already has it)
ALTER TABLE public.content_profiles
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Backfill existing data by name match
UPDATE public.action_items ai
SET client_id = c.id
FROM public.clients c
WHERE ai.client = c.name AND ai.client_id IS NULL;

UPDATE public.content_profiles cp
SET client_id = c.id
FROM public.clients c
WHERE cp.client_name = c.name AND cp.client_id IS NULL;
