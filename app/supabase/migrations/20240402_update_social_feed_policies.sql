-- Diese Migration ändert die bestehenden Policies für den Social Feed

-- Entferne alte Policies
DROP POLICY IF EXISTS "Posts are viewable by everyone with badge level 1" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts if they have badge level 1" ON public.posts;

-- Erstelle neue Policies mit verbesserten Berechtigungen
CREATE POLICY "Posts are viewable by authenticated users"
    ON public.posts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert posts if they have badge level 1 or are admin"
    ON public.posts FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND (
            -- Prüfe auf Admin-Status
            (EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (
                    raw_user_meta_data->>'isAdmin' = 'true' 
                    OR user_metadata->>'isAdmin' = 'true'
                )
            ))
            OR
            -- Oder prüfe auf Badge Level 1
            (EXISTS (
                SELECT 1 
                FROM user_badges ub 
                WHERE ub.user_id = auth.uid() 
                AND ub.badge_id = '4d2e1bf7-37e7-4226-9239-f8a60f608900'
            ))
        )
    );

-- Aktualisiere die Kommentar- und Like-Policies
DROP POLICY IF EXISTS "Users can insert comments if they have badge level 1" ON public.post_comments;
DROP POLICY IF EXISTS "Users can insert likes if they have badge level 1" ON public.post_likes;

CREATE POLICY "Users can insert comments if they have badge level 1 or are admin"
    ON public.post_comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND (
            (EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (
                    raw_user_meta_data->>'isAdmin' = 'true' 
                    OR user_metadata->>'isAdmin' = 'true'
                )
            ))
            OR
            (EXISTS (
                SELECT 1 
                FROM user_badges ub 
                WHERE ub.user_id = auth.uid() 
                AND ub.badge_id = '4d2e1bf7-37e7-4226-9239-f8a60f608900'
            ))
        )
    );

CREATE POLICY "Users can insert likes if they have badge level 1 or are admin"
    ON public.post_likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND (
            (EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (
                    raw_user_meta_data->>'isAdmin' = 'true' 
                    OR user_metadata->>'isAdmin' = 'true'
                )
            ))
            OR
            (EXISTS (
                SELECT 1 
                FROM user_badges ub 
                WHERE ub.user_id = auth.uid() 
                AND ub.badge_id = '4d2e1bf7-37e7-4226-9239-f8a60f608900'
            ))
        )
    );