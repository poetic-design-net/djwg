-- Temporär Constraints entfernen
ALTER TABLE profiles
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN first_name DROP NOT NULL,
    ALTER COLUMN last_name DROP NOT NULL;

-- Unique Constraint für Username hinzufügen
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_username_key,
    ADD CONSTRAINT profiles_username_key UNIQUE (username);

-- Index für schnellere Username-Suchen
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);