-- Entferne alle RLS-Policies von der profiles Tabelle
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Deaktiviere RLS vollständig auf der profiles Tabelle
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Entferne die role-Spalte Änderungen
UPDATE public.profiles 
SET role = NULL 
WHERE role = 'admin';

-- Stattdessen verwenden wir die bestehende Funktionalität und machen keine Änderungen an der Datenbankstruktur