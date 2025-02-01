-- Entferne die bestehende Check-Constraint
ALTER TABLE media_uploads DROP CONSTRAINT IF EXISTS media_uploads_status_check;

-- Füge die neue Check-Constraint hinzu
ALTER TABLE media_uploads ADD CONSTRAINT media_uploads_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'approved', 'rejected'));

-- Setze den Default-Wert für status
ALTER TABLE media_uploads ALTER COLUMN status SET DEFAULT 'pending';