-- Entferne alle existierenden Policies für media_uploads
DROP POLICY IF EXISTS "Admins have full access" ON media_uploads;
DROP POLICY IF EXISTS "Benutzer können eigene Medien aktualisieren" ON media_uploads;
DROP POLICY IF EXISTS "Benutzer können eigene Medien hochladen" ON media_uploads;
DROP POLICY IF EXISTS "Benutzer können eigene Medien löschen" ON media_uploads;
DROP POLICY IF EXISTS "Benutzer können eigene Medien sehen" ON media_uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON media_uploads;
DROP POLICY IF EXISTS "Users can upload media" ON media_uploads;
DROP POLICY IF EXISTS "Users can view own uploads" ON media_uploads;

-- Erstelle eine einzige Policy pro Operation
CREATE POLICY "media_uploads_insert" ON media_uploads 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_uploads_select" ON media_uploads 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "media_uploads_update" ON media_uploads 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "media_uploads_delete" ON media_uploads 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Stelle sicher, dass RLS aktiviert ist
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;