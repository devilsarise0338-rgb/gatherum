-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 0006_add_storage_buckets.sql

-- 1. Public Read Access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- 2. Authenticated Insert Access (scoped to user's folder)
CREATE POLICY "Authenticated users can upload avatars and events" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'images' AND
  owner = auth.uid() AND
  (
    ( (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text )
    OR
    ( (storage.foldername(name))[1] = 'events' AND (storage.foldername(name))[2] = auth.uid()::text )
  )
);

-- 3. Authenticated Update Access (own files only)
CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'images' AND owner = auth.uid()
);

-- 4. Authenticated Delete Access (own files only)
CREATE POLICY "Users can delete their own uploads" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'images' AND owner = auth.uid()
);
