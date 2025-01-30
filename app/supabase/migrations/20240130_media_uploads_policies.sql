-- Enable RLS
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;

-- Policy für INSERT
CREATE POLICY "Benutzer können eigene Medien hochladen"
ON media_uploads FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy für SELECT
CREATE POLICY "Benutzer können eigene Medien sehen"
ON media_uploads FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy für UPDATE
CREATE POLICY "Benutzer können eigene Medien aktualisieren"
ON media_uploads FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy für DELETE
CREATE POLICY "Benutzer können eigene Medien löschen"
ON media_uploads FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);