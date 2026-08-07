DROP POLICY IF EXISTS "Public can upload gto-corpus files" ON storage.objects;

CREATE POLICY "Upload gto-corpus by participant folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'gto-corpus'
  AND EXISTS (
    SELECT 1 FROM public.gto_participantes p
    WHERE p.id::text = (storage.foldername(name))[1]
  )
);