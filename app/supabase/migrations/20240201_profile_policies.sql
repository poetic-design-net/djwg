-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy für INSERT
CREATE POLICY "Benutzer können ihr eigenes Profil erstellen"
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy für SELECT
CREATE POLICY "Benutzer können ihr eigenes Profil sehen"
ON profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Policy für UPDATE
CREATE POLICY "Benutzer können ihr eigenes Profil aktualisieren"
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy für DELETE
CREATE POLICY "Benutzer können ihr eigenes Profil löschen"
ON profiles FOR DELETE 
TO authenticated
USING (auth.uid() = id);