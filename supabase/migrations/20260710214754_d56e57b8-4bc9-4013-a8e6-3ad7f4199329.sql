ALTER TABLE public.client_portal_listening_entries
  ADD COLUMN IF NOT EXISTS media_mentions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_mentions jsonb NOT NULL DEFAULT '[]'::jsonb;