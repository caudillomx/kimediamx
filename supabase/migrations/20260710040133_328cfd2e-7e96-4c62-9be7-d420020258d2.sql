ALTER TABLE public.client_portal_listening_entries
  ADD COLUMN IF NOT EXISTS total_mentions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sentiment_counts jsonb DEFAULT '{}'::jsonb;