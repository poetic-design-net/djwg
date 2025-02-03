-- Basis-Policies für die profiles Tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy die jedem authentifizierten Benutzer erlaubt, sein eigenes Profil zu lesen
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy die es authentifizierten Benutzern erlaubt, Basis-Informationen aller Profile zu lesen
DROP POLICY IF EXISTS "Allow authenticated read all profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy die es Benutzern erlaubt, ihr eigenes Profil zu aktualisieren
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy die es Benutzern erlaubt, ihr eigenes Profil zu löschen
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);