-- Erstelle eine separate Funktion für die Benutzerregistrierung
CREATE OR REPLACE FUNCTION public.handle_auth_signup()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    final_username TEXT;
    counter INT := 0;
    meta_data JSONB;
    first_name_val TEXT;
    last_name_val TEXT;
BEGIN
    -- Extrahiere die verschachtelten Metadaten
    -- Versuche zuerst die tiefste Verschachtelung
    IF NEW.raw_user_meta_data->'raw_user_meta_data'->'raw_user_meta_data'->>'first_name' IS NOT NULL THEN
        first_name_val := NEW.raw_user_meta_data->'raw_user_meta_data'->'raw_user_meta_data'->>'first_name';
        last_name_val := NEW.raw_user_meta_data->'raw_user_meta_data'->'raw_user_meta_data'->>'last_name';
    -- Dann die mittlere Verschachtelung
    ELSIF NEW.raw_user_meta_data->'raw_user_meta_data'->>'first_name' IS NOT NULL THEN
        first_name_val := NEW.raw_user_meta_data->'raw_user_meta_data'->>'first_name';
        last_name_val := NEW.raw_user_meta_data->'raw_user_meta_data'->>'last_name';
    -- Dann die oberste Ebene
    ELSE
        first_name_val := NEW.raw_user_meta_data->>'first_name';
        last_name_val := NEW.raw_user_meta_data->>'last_name';
    END IF;

    -- Generiere Basis-Username
    username_base := LOWER(REGEXP_REPLACE(
        TRIM(
            COALESCE(first_name_val, '') || '.' ||
            COALESCE(last_name_val, '')
        ),
        '[^a-zA-Z0-9.]',
        '',
        'g'
    ));

    -- Wenn kein Username generiert werden konnte, verwende E-Mail-Basis
    IF LENGTH(username_base) < 2 THEN
        username_base := SPLIT_PART(NEW.email, '@', 1);
    END IF;

    -- Finde einen eindeutigen Username
    final_username := username_base;
    WHILE EXISTS (
        SELECT 1 FROM public.profiles WHERE username = final_username
    ) LOOP
        counter := counter + 1;
        final_username := username_base || counter::text;
    END LOOP;

    -- Erstelle das Profil mit Basis-Daten
    BEGIN
        INSERT INTO public.profiles (
            id,
            first_name,
            last_name,
            email,
            username,
            full_name,
            is_public
        ) VALUES (
            NEW.id,
            first_name_val,
            last_name_val,
            NEW.email,
            final_username,
            TRIM(
                COALESCE(first_name_val, '') || ' ' ||
                COALESCE(last_name_val, '')
            ),
            false
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log error details but don't fail the user creation
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erstelle den Trigger für neue Benutzer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_signup();