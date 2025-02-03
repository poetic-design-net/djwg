-- Erlaube allen authentifizierten Benutzern alle Profile zu lesen
DROP POLICY IF EXISTS "Allow authenticated read all profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read all profiles"
ON public.profiles
FOR SELECT
USING (auth.role() = 'authenticated');