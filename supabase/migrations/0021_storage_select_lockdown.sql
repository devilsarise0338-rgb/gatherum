-- 0021_storage_select_lockdown.sql
-- Why this exists (plain words): the `images` bucket had a "Public Access"
-- SELECT policy letting anyone LIST every file via the Storage API
-- (linter 0025). The app never lists files — it only uploads and reads
-- posters/avatars by direct public URL, which works WITHOUT any SELECT
-- policy on a public bucket. So the broad policy is dropped and replaced
-- with nothing. The remaining upload/update/delete policies are recreated
-- unchanged except auth.uid() -> (select auth.uid()), which Postgres can
-- cache once per statement instead of re-evaluating per row.

-- 1. Remove bucket listing for everyone (direct public-URL reads unaffected).
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 2. Recreate scoped policies with cacheable auth calls (same logic as 0006).
DROP POLICY IF EXISTS "Authenticated users can upload avatars and events" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars and events"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  owner = (select auth.uid()) AND
  (
    ( (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = (select auth.uid())::text )
    OR
    ( (storage.foldername(name))[1] = 'events' AND (storage.foldername(name))[2] = (select auth.uid())::text )
  )
);

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND owner = (select auth.uid())
);

DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND owner = (select auth.uid())
);
