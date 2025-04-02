-- Überprüfung der Tabellen und Referenzen
DO $$ 
BEGIN
    -- Überprüfe, ob die 'profiles' Tabelle existiert
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        RAISE EXCEPTION 'Die Tabelle "profiles" muss existieren!';
    END IF;

    -- Überprüfe, ob die 'user_badges' Tabelle existiert
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_badges'
    ) THEN
        RAISE EXCEPTION 'Die Tabelle "user_badges" muss existieren!';
    END IF;

    -- Überprüfe die Foreign Keys für posts
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'posts'
        AND kcu.column_name = 'user_id'
    ) THEN
        -- Wenn der Foreign Key fehlt, erstelle ihn
        ALTER TABLE public.posts
        ADD CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;

    -- Überprüfe die Foreign Keys für post_likes
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'post_likes'
        AND kcu.column_name = 'post_id'
    ) THEN
        ALTER TABLE public.post_likes
        ADD CONSTRAINT fk_post_likes_post
        FOREIGN KEY (post_id)
        REFERENCES public.posts(id)
        ON DELETE CASCADE;
    END IF;

    -- Überprüfe die Foreign Keys für post_comments
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'post_comments'
        AND kcu.column_name = 'post_id'
    ) THEN
        ALTER TABLE public.post_comments
        ADD CONSTRAINT fk_post_comments_post
        FOREIGN KEY (post_id)
        REFERENCES public.posts(id)
        ON DELETE CASCADE;
    END IF;

    -- Überprüfe die Indizes
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

    -- Überprüfe die RLS-Policies
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'Alle Überprüfungen erfolgreich abgeschlossen.';
END $$;

-- Überprüfe die vorhandenen Datensätze auf Konsistenz
CREATE OR REPLACE FUNCTION clean_orphaned_social_records() RETURNS void AS $$
BEGIN
    -- Lösche verwaiste Likes
    DELETE FROM public.post_likes
    WHERE post_id NOT IN (SELECT id FROM public.posts);
    
    -- Lösche verwaiste Kommentare
    DELETE FROM public.post_comments
    WHERE post_id NOT IN (SELECT id FROM public.posts);
    
    -- Lösche Posts von nicht existierenden Benutzern
    DELETE FROM public.posts
    WHERE user_id NOT IN (SELECT id FROM auth.users);
END;
$$ LANGUAGE plpgsql;

-- Führe die Bereinigung aus
SELECT clean_orphaned_social_records();