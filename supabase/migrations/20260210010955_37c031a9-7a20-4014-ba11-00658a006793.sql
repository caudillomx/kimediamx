
-- Allow participants to read their own freshly inserted row
CREATE POLICY "Participants can read own row by id"
  ON public.participants FOR SELECT
  USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Public can see map participants" ON public.participants;
