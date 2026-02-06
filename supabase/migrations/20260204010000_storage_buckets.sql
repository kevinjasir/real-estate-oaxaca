-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- Add coordinates columns to projects if not exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);
