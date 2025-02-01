-- Verbesserte Funktion zum Erstellen von Profilen
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    first_name TEXT;
    last_name TEXT;
    avatar_url TEXT;
BEGIN
    -- Extrahiere first_name und last_name basierend auf der Authentifizierungsmethode
    IF NEW.raw_user_meta_data->>'provider' = 'google' THEN
        -- Für Google Auth: Verwende den vollen Namen und teile ihn auf
        first_name := split_part(NEW.raw_user_meta_data->>'name', ' ', 1);
        last_name := substring(NEW.raw_user_meta_data->>'name' FROM position(' ' IN NEW.raw_user_meta_data->>'name') + 1);
        avatar_url := NEW.raw_user_meta_data->>'picture';
    ELSE
        -- Für normale Email Auth
        first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
        last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
        avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', '');
    END IF;

    -- Erstelle das Profil mit den extrahierten Daten
    INSERT INTO public.profiles (
        id,
        full_name,
        avatar_url,
        username
    ) VALUES (
        NEW.id,
        TRIM(first_name || ' ' || last_name),
        avatar_url,
        LOWER(REGEXP_REPLACE(TRIM(first_name || '.' || last_name), '[^a-zA-Z0-9.]', '', 'g'))
    );

    -- Aktualisiere die user_metadata mit den aufbereiteten Daten
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{first_name}',
            to_jsonb(first_name)
        ),
        '{last_name}',
        to_jsonb(last_name)
    )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;