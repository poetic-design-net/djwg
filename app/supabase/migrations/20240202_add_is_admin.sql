-- Füge isAdmin Spalte zur profiles Tabelle hinzu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Setze isAdmin für die bekannten Admin-E-Mails
UPDATE public.profiles 
SET is_admin = true 
WHERE email IN ('hallo@frdrk.de', 'info@djworkshopgermany.de');

-- Erlaube allen authentifizierten Benutzern alle Profile zu lesen
DROP POLICY IF EXISTS "Allow authenticated read all profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');