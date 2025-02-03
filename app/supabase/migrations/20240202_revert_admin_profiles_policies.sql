-- Entferne die RLS Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Deaktiviere RLS auf der profiles Tabelle
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Setze die Role zurück
UPDATE public.profiles 
SET role = NULL 
WHERE email IN ('hallo@frdrk.de', 'info@djworkshopgermany.de');