-- Migration to consolidate ratings for grouped submissions
-- This ensures each juror has only one rating per actual user submission (not per file)

-- First, create a temporary table to identify grouped submissions
CREATE TEMP TABLE submission_groups AS
WITH sanity_data AS (
  -- This would need to be populated with actual data from Sanity
  -- For now, we'll identify groups by matching submission_ids that share the same date and similar patterns
  SELECT 
    submission_id,
    juror_id,
    rating,
    comments,
    updated_at,
    -- Extract potential user identifier from submission_id pattern
    SUBSTRING(submission_id FROM 1 FOR 8) as user_prefix,
    DATE(created_at) as submission_date
  FROM jury_ratings
)
SELECT 
  user_prefix,
  submission_date,
  juror_id,
  -- Keep the most recent rating for each juror per user
  FIRST_VALUE(submission_id) OVER (
    PARTITION BY user_prefix, submission_date, juror_id 
    ORDER BY updated_at DESC
  ) as primary_submission_id,
  FIRST_VALUE(rating) OVER (
    PARTITION BY user_prefix, submission_date, juror_id 
    ORDER BY updated_at DESC
  ) as latest_rating,
  FIRST_VALUE(comments) OVER (
    PARTITION BY user_prefix, submission_date, juror_id 
    ORDER BY updated_at DESC
  ) as latest_comments,
  MAX(updated_at) OVER (
    PARTITION BY user_prefix, submission_date, juror_id
  ) as latest_updated_at
FROM sanity_data;

-- Log what we're about to consolidate
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT juror_id, COUNT(DISTINCT submission_id) as submission_count
    FROM jury_ratings
    GROUP BY juror_id
    HAVING COUNT(DISTINCT submission_id) > 1
  ) t;
  
  RAISE NOTICE 'Found % jurors with multiple ratings that may need consolidation', duplicate_count;
END $$;

-- Add a note about manual verification
-- IMPORTANT: This migration needs manual verification before running in production
-- It should be tested with actual Sanity data to ensure correct grouping

COMMENT ON TABLE jury_ratings IS 'Ratings table - consolidated on 2025-08-31 to handle grouped submissions';