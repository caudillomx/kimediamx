
-- Add avatar_url column to content_profiles
ALTER TABLE public.content_profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for client avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-avatars', 'client-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'client-avatars');

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'client-avatars');

-- Allow authenticated users to update/delete their avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'client-avatars');

CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'client-avatars');
