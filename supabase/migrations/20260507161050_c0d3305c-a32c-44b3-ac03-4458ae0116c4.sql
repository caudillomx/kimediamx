-- Allow returning the inserted row to anonymous participants in the GTO course flow.
-- Listing is still done via SECURITY DEFINER RPC `gto_list_corpus_uploads`, so this
-- only enables the .select() that follows .insert() in the client.
CREATE POLICY "Public can read own corpus upload row"
ON public.gto_corpus_uploads
FOR SELECT
TO public
USING (true);