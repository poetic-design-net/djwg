-- Policies für user_badges Tabelle
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policy für Lesen der eigenen Badges
CREATE POLICY "Users can read their own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

-- Policy für Trigger und Admin-Benutzer
DROP POLICY IF EXISTS "System can manage badges" ON public.user_badges;
CREATE POLICY "System and admins can manage badges"
ON public.user_badges
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (
            -- Entweder Admin
            profiles.role = 'admin'
            OR 
            -- Oder das eigene Profil
            profiles.id = public.user_badges.user_id
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (
            -- Entweder Admin
            profiles.role = 'admin'
            OR 
            -- Oder das eigene Profil
            profiles.id = public.user_badges.user_id
        )
    )
);

-- Badges Tabelle Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Jeder kann Badges sehen
CREATE POLICY "Anyone can view badges"
ON public.badges
FOR SELECT
USING (true);

-- Nur Admins können Badges verwalten
CREATE POLICY "Only admins can manage badges"
ON public.badges
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);