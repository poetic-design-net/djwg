-- Remove the old policy
DROP POLICY IF EXISTS "DJ availability entries are viewable by everyone authenticated" ON public.dj_availability;

-- Create new policy that allows everyone to view DJ availability entries
CREATE POLICY "DJ availability entries are viewable by everyone"
    ON public.dj_availability FOR SELECT
    USING (true);