-- Neue Felder für DJ-Profile hinzufügen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS travel_group_size INTEGER,
ADD COLUMN IF NOT EXISTS travel_group_ages TEXT,
ADD COLUMN IF NOT EXISTS visited_clubs TEXT[], -- Array von Club-Namen
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS video_mix_url TEXT;

-- Kommentare für die neuen Felder hinzufügen
COMMENT ON COLUMN profiles.phone IS 'Telefonnummer des DJs';
COMMENT ON COLUMN profiles.travel_group_size IS 'Anzahl der reisenden Personen (inkl. DJ)';
COMMENT ON COLUMN profiles.travel_group_ages IS 'Alter der reisenden Personen';
COMMENT ON COLUMN profiles.visited_clubs IS 'Liste der bereits besuchten Clubs';
COMMENT ON COLUMN profiles.biography IS 'Kurzbiografie mit Referenzen, Stilrichtungen, Erfahrungen';
COMMENT ON COLUMN profiles.video_mix_url IS 'URL zum Video-Mix';

-- RLS-Policies aktualisieren
ALTER POLICY "Users can update own profile."
    ON public.profiles
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Index für performance-kritische Felder
CREATE INDEX IF NOT EXISTS idx_profiles_dj_fields
    ON profiles (id)
    INCLUDE (phone, travel_group_size, visited_clubs);