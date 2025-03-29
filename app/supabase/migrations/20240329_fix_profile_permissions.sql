-- Korrigiere die Berechtigungen für Profile-Tabelle
GRANT INSERT ON profiles TO authenticated;

-- Entferne SECURITY DEFINER von der Synchronisationsfunktion
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
$$ LANGUAGE plpgsql;

-- Stelle sicher, dass der Trigger weiterhin funktioniert
DROP TRIGGER IF EXISTS sync_auth_profile_timestamps ON auth.users;
CREATE TRIGGER sync_auth_profile_timestamps
  AFTER INSERT OR UPDATE OF created_at, last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_auth_profile_timestamps();

-- Stelle sicher, dass alle notwendigen Berechtigungen vorhanden sind
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON auth.users TO authenticated;