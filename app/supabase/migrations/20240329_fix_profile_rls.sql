-- Stelle sicher, dass RLS aktiviert ist
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Entferne möglicherweise vorhandene Policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON profiles;
DROP POLICY IF EXISTS "Profiles can be updated by users who created them" ON profiles;
DROP POLICY IF EXISTS "Profiles can be created by authenticated users" ON profiles;

-- Erstelle neue Policies
CREATE POLICY "Profiles are viewable by users who created them"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Profiles can be updated by users who created them"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles can be created by authenticated users"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Stelle die Grundberechtigungen sicher
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Erstelle die Trigger-Funktion neu ohne SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.sync_auth_profile_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT NOT EXISTS(SELECT 1 FROM profiles WHERE id = NEW.id)) THEN
    INSERT INTO profiles (id, auth_created_at, auth_last_sign_in_at)
    VALUES (NEW.id, NEW.created_at, NEW.last_sign_in_at);
  ELSE
    UPDATE profiles
    SET 
      auth_created_at = NEW.created_at,
      auth_last_sign_in_at = NEW.last_sign_in_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aktualisiere den Trigger
DROP TRIGGER IF EXISTS sync_auth_profile_timestamps ON auth.users;
CREATE TRIGGER sync_auth_profile_timestamps
  AFTER INSERT OR UPDATE OF created_at, last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_profile_timestamps();