CREATE TABLE IF NOT EXISTS public.dj_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'tentative', 'booked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Add RLS (Row Level Security)
ALTER TABLE public.dj_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow all authenticated users to view DJ availability entries
CREATE POLICY "DJ availability entries are viewable by everyone authenticated"
    ON public.dj_availability FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to create entries
CREATE POLICY "Users can insert their own DJ availability entries"
    ON public.dj_availability FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own entries with valid status transitions
CREATE POLICY "Users can update their own DJ availability entries"
    ON public.dj_availability FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own entries
CREATE POLICY "Users can delete their own DJ availability entries"
    ON public.dj_availability FOR DELETE
    USING (auth.uid() = user_id);

-- Create optimized indexes for better performance
CREATE INDEX IF NOT EXISTS dj_availability_user_date_idx 
    ON public.dj_availability(user_id, start_date, end_date);
    
CREATE INDEX IF NOT EXISTS dj_availability_date_status_idx 
    ON public.dj_availability(start_date, end_date, status);

-- Function to validate status transitions
CREATE OR REPLACE FUNCTION check_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    IF NOT (
        CASE 
            WHEN OLD.status = 'available' THEN NEW.status IN ('tentative', 'booked')
            WHEN OLD.status = 'tentative' THEN NEW.status IN ('available', 'booked')
            WHEN OLD.status = 'booked' THEN NEW.status IN ('available')
            ELSE false
        END
    ) THEN
        RAISE EXCEPTION 'Ungültiger Status-Übergang von % zu %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for status transitions
CREATE TRIGGER check_status_transition
    BEFORE UPDATE ON public.dj_availability
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION check_status_transition();

-- Create the updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.dj_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add helpful comments for future reference
COMMENT ON TABLE public.dj_availability IS 'Speichert DJ Verfügbarkeiten mit Statusverwaltung';
COMMENT ON COLUMN public.dj_availability.status IS 'Status kann sein: available (verfügbar), tentative (vorläufig), booked (gebucht)';