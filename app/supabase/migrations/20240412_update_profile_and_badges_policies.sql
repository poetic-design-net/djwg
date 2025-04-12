-- Allow public read access to profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Allow public read access to user_badges
DROP POLICY IF EXISTS "Public user badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "Public user badges are viewable by everyone"
    ON public.user_badges FOR SELECT
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;