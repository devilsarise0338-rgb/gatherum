-- ROLLBACK for 0021_storage_select_lockdown.sql — UNTESTED (no local DB available).
-- Apply only after rolling back 0026..0022 first (reverse order), or on a DB
-- where 0021 is the newest applied migration. Restores the exact 0006
-- policies, including the broad "Public Access" SELECT (re-opens bucket
-- listing — that is the point of rolling back).

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload avatars and events" ON storage.objects;
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

DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND owner = auth.uid()
);

DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND owner = auth.uid()
);

-- Keep migration history consistent if you abandon 0021 (not if re-applying):
--   DELETE FROM supabase_migrations.schema_migrations WHERE version = '0021';
