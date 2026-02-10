
-- New fields for enriched Welcome step
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS approx_followers text,
ADD COLUMN IF NOT EXISTS main_channel text,
ADD COLUMN IF NOT EXISTS has_comm_team boolean,
ADD COLUMN IF NOT EXISTS publication_frequency text,
ADD COLUMN IF NOT EXISTS goal_90_days text,
ADD COLUMN IF NOT EXISTS self_perception text,
ADD COLUMN IF NOT EXISTS comm_budget text;
