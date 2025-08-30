-- Create jury_ratings table for storing video ratings from jury members
CREATE TABLE IF NOT EXISTS public.jury_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT NOT NULL, -- References Sanity awardUpload document ID
  juror_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comments TEXT,
  category TEXT CHECK (category IN ('djing', 'producing', 'performance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, juror_id) -- Prevent duplicate ratings per juror
);

-- Create index for faster queries
CREATE INDEX idx_jury_ratings_submission ON public.jury_ratings(submission_id);
CREATE INDEX idx_jury_ratings_juror ON public.jury_ratings(juror_id);
CREATE INDEX idx_jury_ratings_category ON public.jury_ratings(category);

-- Enable RLS
ALTER TABLE public.jury_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Jurors can view and manage their own ratings
CREATE POLICY "Jurors can manage their own ratings"
ON public.jury_ratings
FOR ALL
TO authenticated
USING (auth.uid() = juror_id)
WITH CHECK (auth.uid() = juror_id);

-- Policy: Users with award badge can view all submissions (for statistics)
CREATE POLICY "Award badge holders can view ratings"
ON public.jury_ratings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_badges
    WHERE user_id = auth.uid()
    AND badge_id = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1'::UUID
  )
);

-- Policy: Admins can view all ratings (using role column from profiles)
CREATE POLICY "Admins can view all ratings"
ON public.jury_ratings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Create view for jury progress tracking
CREATE OR REPLACE VIEW public.jury_progress AS
SELECT 
  juror_id,
  COUNT(DISTINCT submission_id) as rated_count,
  COUNT(DISTINCT category) as categories_rated,
  ROUND(AVG(rating)::numeric, 2) as average_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating,
  MAX(updated_at) as last_activity
FROM public.jury_ratings
GROUP BY juror_id;

-- Grant access to the view
GRANT SELECT ON public.jury_progress TO authenticated;

-- Create view for submission statistics
CREATE OR REPLACE VIEW public.submission_stats AS
SELECT 
  submission_id,
  category,
  COUNT(DISTINCT juror_id) as total_ratings,
  ROUND(AVG(rating)::numeric, 2) as average_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating,
  ROUND(STDDEV(rating)::numeric, 2) as rating_deviation
FROM public.jury_ratings
GROUP BY submission_id, category;

-- Grant access to the view
GRANT SELECT ON public.submission_stats TO authenticated;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_jury_ratings_updated_at
BEFORE UPDATE ON public.jury_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to get jury member statistics
CREATE OR REPLACE FUNCTION get_jury_statistics(p_juror_id UUID)
RETURNS TABLE (
  total_submissions BIGINT,
  rated_submissions BIGINT,
  pending_submissions BIGINT,
  completion_percentage NUMERIC,
  average_rating NUMERIC,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH submission_counts AS (
    SELECT COUNT(*) as total
    FROM (
      SELECT DISTINCT submission_id 
      FROM public.jury_ratings
    ) s
  ),
  juror_stats AS (
    SELECT 
      COUNT(DISTINCT submission_id) as rated,
      ROUND(AVG(rating)::numeric, 2) as avg_rating,
      MAX(updated_at) as last_act
    FROM public.jury_ratings
    WHERE juror_id = p_juror_id
  )
  SELECT 
    sc.total,
    COALESCE(js.rated, 0),
    sc.total - COALESCE(js.rated, 0),
    CASE 
      WHEN sc.total > 0 
      THEN ROUND((COALESCE(js.rated, 0)::numeric / sc.total) * 100, 2)
      ELSE 0
    END,
    js.avg_rating,
    js.last_act
  FROM submission_counts sc
  CROSS JOIN juror_stats js;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_jury_statistics(UUID) TO authenticated;