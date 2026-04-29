
-- Storage bucket privado para documentos del corpus subidos por participantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('gto-corpus', 'gto-corpus', false)
ON CONFLICT (id) DO NOTHING;

-- Tabla para registrar archivos del corpus subidos por cada participante
CREATE TABLE IF NOT EXISTS public.gto_corpus_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES public.gto_sesiones(id) ON DELETE CASCADE,
  participante_id UUID NOT NULL REFERENCES public.gto_participantes(id) ON DELETE CASCADE,
  doc_tipo TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gto_corpus_uploads_part ON public.gto_corpus_uploads(participante_id);
CREATE INDEX IF NOT EXISTS idx_gto_corpus_uploads_sesion ON public.gto_corpus_uploads(sesion_id);

ALTER TABLE public.gto_corpus_uploads ENABLE ROW LEVEL SECURITY;

-- Acceso anónimo controlado por participante_id (consistente con el resto del flujo del curso GTO)
CREATE POLICY "Anyone can read corpus uploads"
ON public.gto_corpus_uploads FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert corpus uploads"
ON public.gto_corpus_uploads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete corpus uploads"
ON public.gto_corpus_uploads FOR DELETE
USING (true);

-- Storage policies para el bucket gto-corpus
CREATE POLICY "Public can read gto-corpus files"
ON storage.objects FOR SELECT
USING (bucket_id = 'gto-corpus');

CREATE POLICY "Public can upload gto-corpus files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gto-corpus');

CREATE POLICY "Public can delete gto-corpus files"
ON storage.objects FOR DELETE
USING (bucket_id = 'gto-corpus');
