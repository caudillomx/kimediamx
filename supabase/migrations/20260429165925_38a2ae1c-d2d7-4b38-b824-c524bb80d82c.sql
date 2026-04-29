
-- 1) Quitar políticas permisivas previas en la tabla
DROP POLICY IF EXISTS "Anyone can read corpus uploads" ON public.gto_corpus_uploads;
DROP POLICY IF EXISTS "Anyone can delete corpus uploads" ON public.gto_corpus_uploads;

-- Mantener INSERT abierto (el flujo es anónimo)
-- Asegurar que solo admins lean/borren directamente
CREATE POLICY "Admins can read corpus uploads"
ON public.gto_corpus_uploads FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete corpus uploads"
ON public.gto_corpus_uploads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Funciones SECURITY DEFINER para que el participante acceda solo a lo suyo
CREATE OR REPLACE FUNCTION public.gto_list_corpus_uploads(_participante_id uuid)
RETURNS TABLE (
  id uuid,
  sesion_id uuid,
  participante_id uuid,
  doc_tipo text,
  file_name text,
  storage_path text,
  file_size bigint,
  mime_type text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, sesion_id, participante_id, doc_tipo, file_name, storage_path,
         file_size, mime_type, created_at
  FROM public.gto_corpus_uploads
  WHERE participante_id = _participante_id
  ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.gto_delete_corpus_upload(_upload_id uuid, _participante_id uuid)
RETURNS TABLE (storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_path text;
BEGIN
  DELETE FROM public.gto_corpus_uploads
  WHERE id = _upload_id AND participante_id = _participante_id
  RETURNING gto_corpus_uploads.storage_path INTO v_path;

  IF v_path IS NULL THEN
    RAISE EXCEPTION 'Upload not found or not owned by participant';
  END IF;

  RETURN QUERY SELECT v_path;
END;
$$;

GRANT EXECUTE ON FUNCTION public.gto_list_corpus_uploads(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.gto_delete_corpus_upload(uuid, uuid) TO anon, authenticated;

-- 3) Endurecer políticas de storage para el bucket gto-corpus
-- Recordar el patrón de path: {participante_id}/{doc_tipo}/{timestamp}_{filename}
DROP POLICY IF EXISTS "Public can read gto-corpus files" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete gto-corpus files" ON storage.objects;

CREATE POLICY "Read gto-corpus by participant folder"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gto-corpus'
  AND EXISTS (
    SELECT 1 FROM public.gto_participantes p
    WHERE p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Delete gto-corpus by participant folder"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gto-corpus'
  AND EXISTS (
    SELECT 1 FROM public.gto_participantes p
    WHERE p.id::text = (storage.foldername(name))[1]
  )
);
