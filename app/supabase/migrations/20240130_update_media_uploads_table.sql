-- Mache storage_path optional
ALTER TABLE media_uploads ALTER COLUMN storage_path DROP NOT NULL;

-- Setze default NULL für storage_path
ALTER TABLE media_uploads ALTER COLUMN storage_path SET DEFAULT NULL;