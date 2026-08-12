ALTER TABLE public.client_portal_listening_entries
  ADD COLUMN IF NOT EXISTS scope_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS national_context jsonb NOT NULL DEFAULT '[]'::jsonb;