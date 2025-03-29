-- Aktualisiere die profiles Tabelle, um alle Felder aus dem TypeScript Interface zu unterstützen
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"instagram": null, "facebook": null, "soundcloud": null}',
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Setze NOT NULL Constraint für wichtige Felder
ALTER TABLE profiles
  ALTER COLUMN is_public SET NOT NULL,
  ALTER COLUMN id SET NOT NULL;

-- Erstelle einen Index für häufig abgefragte Felder
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Aktualisiere oder erstelle die RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile können von ihren Besitzern und Admins gesehen werden
CREATE POLICY "Profiles are viewable by owners and admins" ON profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id 
  OR (SELECT is_admin FROM user_roles WHERE user_id = auth.uid())
  OR is_public = true
);

-- Profile können nur von ihren Besitzern aktualisiert werden
CREATE POLICY "Profiles can be updated by owners" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Profile können von authentifizierten Nutzern erstellt werden
CREATE POLICY "Profiles can be created by authenticated users" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Grundberechtigungen
GRANT ALL ON profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;