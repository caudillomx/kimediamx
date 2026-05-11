ALTER TABLE public.gto_mcn_scores
  ADD COLUMN IF NOT EXISTS computed_at timestamptz,
  ADD COLUMN IF NOT EXISTS evidence jsonb DEFAULT '{}'::jsonb;