CREATE POLICY "Anyone can read corpus uploads"
ON public.gto_corpus_uploads
FOR SELECT
USING (true);