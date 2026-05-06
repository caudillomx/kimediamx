
CREATE TABLE public.client_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  file_url TEXT,
  file_name TEXT,
  source_reference TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_corpus_client_id ON public.client_corpus(client_id);
CREATE INDEX idx_client_corpus_source_ref ON public.client_corpus(source_reference);

ALTER TABLE public.client_corpus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read corpus" ON public.client_corpus
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert corpus" ON public.client_corpus
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update corpus" ON public.client_corpus
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete corpus" ON public.client_corpus
  FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admins manage corpus" ON public.client_corpus
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_client_corpus_updated_at
  BEFORE UPDATE ON public.client_corpus
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- Migrate existing brand_essence
INSERT INTO public.client_corpus (client_id, entry_type, title, content, source_reference)
SELECT cp.client_id, 'brandbook',
       'Esencia de marca — ' || cp.client_name,
       cp.brand_essence,
       'migrated_from_content_profiles'
FROM public.content_profiles cp
WHERE cp.client_id IS NOT NULL
  AND cp.brand_essence IS NOT NULL
  AND trim(cp.brand_essence) != '';

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-corpus-files', 'client-corpus-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated read corpus files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-corpus-files');
CREATE POLICY "Authenticated upload corpus files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-corpus-files');
CREATE POLICY "Authenticated delete corpus files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-corpus-files');
