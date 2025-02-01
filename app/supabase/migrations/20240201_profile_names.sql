-- Füge first_name, last_name und email Spalten hinzu
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Erstelle Funktion zur Synchronisation der Namen
CREATE OR REPLACE FUNCTION sync_profile_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Setze full_name nur wenn mindestens einer der Namen vorhanden ist
  IF NEW.first_name IS NOT NULL OR NEW.last_name IS NOT NULL THEN
    NEW.full_name = TRIM(CONCAT(COALESCE(NEW.first_name, ''), ' ', COALESCE(NEW.last_name, '')));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Erstelle Trigger für die Synchronisation
DROP TRIGGER IF EXISTS profile_names_sync ON profiles;
CREATE TRIGGER profile_names_sync
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_profile_names();

-- Temporäre Funktion zur Namensaufteilung
CREATE OR REPLACE FUNCTION split_full_name(full_name text)
RETURNS TABLE(first_name text, last_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE 
      WHEN POSITION(' ' IN full_name) > 0 THEN
        SPLIT_PART(full_name, ' ', 1)
      ELSE
        full_name
    END as first_name,
    CASE 
      WHEN POSITION(' ' IN full_name) > 0 THEN
        SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
      ELSE
        ''
    END as last_name;
END;
$$ LANGUAGE plpgsql;

-- Migriere bestehende Daten
WITH user_data AS (
  SELECT 
    id,
    raw_user_meta_data->>'email' as email,
    COALESCE(
      raw_user_meta_data->>'first_name',
      raw_user_meta_data->>'firstname'
    ) as first_name,
    raw_user_meta_data->>'last_name' as last_name
  FROM auth.users
)
UPDATE profiles p
SET
  first_name = COALESCE(n.first_name, ud.first_name),
  last_name = COALESCE(n.last_name, ud.last_name),
  email = ud.email
FROM (
  SELECT id, (split_full_name(full_name)).* 
  FROM profiles
  WHERE full_name IS NOT NULL
) n
JOIN user_data ud ON ud.id = p.id
WHERE p.id = n.id;

-- Lösche temporäre Funktion
DROP FUNCTION IF EXISTS split_full_name(text);

-- Erstelle einen Index für schnellere Email-Suchen
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Setze NOT NULL Constraint für email
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL;