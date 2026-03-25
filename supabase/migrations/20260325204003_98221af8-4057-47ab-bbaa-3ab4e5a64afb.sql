INSERT INTO storage.buckets (id, name, public) VALUES ('client-brandbooks', 'client-brandbooks', false);

CREATE POLICY "Authenticated users can upload brandbooks" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'client-brandbooks');
CREATE POLICY "Authenticated users can read brandbooks" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'client-brandbooks');
CREATE POLICY "Authenticated users can update brandbooks" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'client-brandbooks');
CREATE POLICY "Authenticated users can delete brandbooks" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'client-brandbooks');