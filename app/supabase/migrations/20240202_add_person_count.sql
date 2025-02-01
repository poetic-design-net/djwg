-- Add person_count column with default value of 1
ALTER TABLE party_registrations 
ADD COLUMN person_count INTEGER NOT NULL DEFAULT 1 CHECK (person_count > 0 AND person_count <= 10);