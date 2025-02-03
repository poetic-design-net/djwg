-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy für alle Benutzer, ihr eigenes Profil zu lesen
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy für Admins, alle Profile zu lesen
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Setze die Role für die Admin-E-Mails
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('hallo@frdrk.de', 'info@djworkshopgermany.de');