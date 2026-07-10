ALTER TABLE public.client_portal_listening_entries
  ADD COLUMN IF NOT EXISTS channels jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS entities jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS events jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS key_quotes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb;