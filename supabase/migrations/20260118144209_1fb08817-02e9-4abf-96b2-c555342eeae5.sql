-- Create gallery storage bucket for user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to gallery bucket
CREATE POLICY "Anyone can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Allow anyone to view gallery images
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Allow anyone to update their gallery images
CREATE POLICY "Anyone can update gallery images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery');

-- Allow anyone to delete gallery images
CREATE POLICY "Anyone can delete gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery');