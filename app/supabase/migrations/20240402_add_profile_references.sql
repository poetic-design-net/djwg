-- Stelle sicher, dass die Profile-Referenzen korrekt sind
DO $$ 
BEGIN
    -- Prüfe, ob die Spalte profiles.id den gleichen Typ wie auth.users.id hat
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'id'
        AND data_type = 'uuid'
    ) THEN
        -- Füge Foreign Key für Posts -> Profiles hinzu
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_posts_profile'
        ) THEN
            ALTER TABLE public.posts
            ADD CONSTRAINT fk_posts_profile
            FOREIGN KEY (user_id)
            REFERENCES public.profiles(id)
            ON DELETE CASCADE;
        END IF;

        -- Füge Foreign Key für Comments -> Profiles hinzu
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_comments_profile'
        ) THEN
            ALTER TABLE public.post_comments
            ADD CONSTRAINT fk_comments_profile
            FOREIGN KEY (user_id)
            REFERENCES public.profiles(id)
            ON DELETE CASCADE;
        END IF;

        -- Erstelle oder aktualisiere Indizes für user_id
        CREATE INDEX IF NOT EXISTS idx_posts_user_id 
        ON public.posts(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_comments_user_id 
        ON public.post_comments(user_id);
    ELSE
        RAISE EXCEPTION 'Die profiles Tabelle hat nicht die erwartete Struktur!';
    END IF;
    
    -- Aktualisiere die RLS-Policies für JOIN-Operationen
    ALTER TABLE public.profiles
    ENABLE ROW LEVEL SECURITY;

    -- Erlaube Lesen von Profilen für authentifizierte Benutzer
    DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
    CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

    RAISE NOTICE 'Profile-Referenzen wurden erfolgreich aktualisiert.';
END $$;