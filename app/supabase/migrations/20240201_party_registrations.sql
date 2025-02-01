-- Create party registrations table
CREATE TABLE party_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE party_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow anyone to insert" ON party_registrations
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow anyone to view count
CREATE POLICY "Allow anyone to view" ON party_registrations
    FOR SELECT
    TO public
    USING (true);