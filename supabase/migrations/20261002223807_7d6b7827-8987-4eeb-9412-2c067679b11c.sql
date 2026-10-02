CREATE TABLE public.cfl_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  option text NOT NULL,
  voter text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question, voter)
);
GRANT SELECT, INSERT, UPDATE ON public.cfl_votes TO anon, authenticated;
GRANT ALL ON public.cfl_votes TO service_role;
ALTER TABLE public.cfl_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read votes" ON public.cfl_votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public cast vote" ON public.cfl_votes FOR INSERT TO anon, authenticated
  WITH CHECK (length(question) <= 40 AND length(option) <= 60 AND length(voter) BETWEEN 8 AND 64);
CREATE POLICY "Public change own vote" ON public.cfl_votes FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (length(option) <= 60);
ALTER PUBLICATION supabase_realtime ADD TABLE public.cfl_votes;