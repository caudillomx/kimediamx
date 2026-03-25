
INSERT INTO storage.buckets (id, name, public) VALUES ('content-inputs', 'content-inputs', true);

CREATE POLICY "Anyone can upload content input files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-inputs');

CREATE POLICY "Anyone can read content input files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'content-inputs');

CREATE POLICY "Anyone can delete content input files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-inputs');
