-- SIMPLIFIED VERSION - Nur In-App Notifications, ohne Email

-- Create award_notifications table for tracking admin notifications
CREATE TABLE IF NOT EXISTS public.award_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id TEXT NOT NULL, -- Sanity awardUpload document ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User who submitted
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  submission_type TEXT DEFAULT 'award' NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Notification metadata
  notification_data JSONB DEFAULT '{}',
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  
  -- Indexing for performance
  CONSTRAINT unique_submission_notification UNIQUE(submission_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_award_notifications_status ON public.award_notifications(status);
CREATE INDEX idx_award_notifications_created ON public.award_notifications(created_at DESC);
CREATE INDEX idx_award_notifications_user ON public.award_notifications(user_id);

-- Enable RLS
ALTER TABLE public.award_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all award notifications"
ON public.award_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Admins can update notification status
CREATE POLICY "Admins can update award notifications"
ON public.award_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Create function to handle new award uploads
CREATE OR REPLACE FUNCTION public.handle_new_award_upload()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Get user information
  SELECT 
    COALESCE(p.username, u.raw_user_meta_data->>'name', u.email),
    u.email
  INTO v_user_name, v_user_email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = NEW.user_id;

  -- Create notification for admins (ohne Email-Versand)
  INSERT INTO public.award_notifications (
    submission_id,
    user_id,
    user_name,
    user_email,
    file_name,
    file_type,
    file_size,
    notification_data,
    priority
  ) VALUES (
    COALESCE(NEW.sanity_id, NEW.id::TEXT),
    NEW.user_id,
    v_user_name,
    v_user_email,
    NEW.original_filename,
    NEW.file_type,
    NEW.file_size,
    jsonb_build_object(
      'upload_id', NEW.id,
      'sanity_id', NEW.sanity_id,
      'metadata', NEW.metadata
    ),
    CASE 
      WHEN NEW.file_size > 100000000 THEN 'high' -- Files over 100MB
      ELSE 'normal'
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new award uploads
DROP TRIGGER IF EXISTS on_award_upload_created ON public.media_uploads;
CREATE TRIGGER on_award_upload_created
  AFTER INSERT ON public.media_uploads
  FOR EACH ROW
  WHEN (NEW.metadata->>'upload_type' = 'award')
  EXECUTE FUNCTION public.handle_new_award_upload();

-- Create view for admin notification summary
CREATE OR REPLACE VIEW public.award_notification_summary AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'unread') as unread_count,
  COUNT(*) FILTER (WHERE status = 'read') as read_count,
  COUNT(*) as total_count,
  MAX(created_at) as latest_notification,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d_count
FROM public.award_notifications;

-- Grant access to the summary view
GRANT SELECT ON public.award_notification_summary TO authenticated;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_award_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.award_notifications
  SET 
    status = 'read',
    read_at = NOW(),
    read_by = auth.uid()
  WHERE id = p_notification_id
  AND status = 'unread';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_award_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.award_notifications
  SET 
    status = 'read',
    read_at = NOW(),
    read_by = auth.uid()
  WHERE status = 'unread';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count for admins
CREATE OR REPLACE FUNCTION public.get_unread_award_notification_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN 0;
  END IF;
  
  SELECT COUNT(*)
  INTO v_count
  FROM public.award_notifications
  WHERE status = 'unread';
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;