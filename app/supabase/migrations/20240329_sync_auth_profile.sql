-- Füge die neuen Spalten zur Profile-Tabelle hinzu
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Aktualisiere bestehende Profile mit den Daten aus auth.users
UPDATE profiles
SET 
  auth_created_at = auth.users.created_at,
  auth_last_sign_in_at = auth.users.last_sign_in_at
FROM auth.users
WHERE profiles.id = auth.users.id;

-- Erstelle eine Funktion für die Synchronisation
CREATE OR REPLACE FUNCTION public.sync_auth_profile_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    auth_created_at = NEW.created_at,
    auth_last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erstelle einen Trigger, der bei Änderungen an auth.users ausgelöst wird
DROP TRIGGER IF EXISTS sync_auth_profile_timestamps ON auth.users;
CREATE TRIGGER sync_auth_profile_timestamps
  AFTER INSERT OR UPDATE OF created_at, last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_profile_timestamps();