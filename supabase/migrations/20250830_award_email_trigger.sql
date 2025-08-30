-- Create function to send email notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_award_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_payload JSONB;
BEGIN
  -- Only send email for new unread notifications
  IF NEW.status = 'unread' AND NEW.email_sent = false THEN
    -- Prepare payload for Edge Function
    v_payload := jsonb_build_object(
      'notificationId', NEW.id,
      'userName', NEW.user_name,
      'userEmail', NEW.user_email,
      'fileName', NEW.file_name,
      'fileType', NEW.file_type,
      'submittedAt', NEW.created_at
    );
    
    -- Call Edge Function asynchronously using pg_net extension
    -- Note: You need to enable pg_net extension in Supabase Dashboard
    PERFORM net.http_post(
      url := (SELECT current_setting('app.settings.edge_function_url') || '/send-award-notification'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := v_payload
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send email notifications
CREATE TRIGGER on_award_notification_created
  AFTER INSERT ON public.award_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_award_email_notification();

-- Alternative: Use Supabase Webhook instead of pg_net
-- This can be configured in Supabase Dashboard under Database Webhooks
COMMENT ON TABLE public.award_notifications IS 
'Award submission notifications for admins. 
Configure webhook in Supabase Dashboard:
- Name: award-email-notification
- Table: award_notifications
- Events: INSERT
- URL: https://YOUR_PROJECT.supabase.co/functions/v1/send-award-notification
- Method: POST
- Headers: Authorization: Bearer YOUR_SERVICE_ROLE_KEY';

-- Create helper function to manually trigger email for a notification
CREATE OR REPLACE FUNCTION public.resend_award_notification_email(p_notification_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_notification RECORD;
  v_payload JSONB;
BEGIN
  -- Get notification details
  SELECT * INTO v_notification
  FROM public.award_notifications
  WHERE id = p_notification_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found';
  END IF;
  
  -- Prepare payload
  v_payload := jsonb_build_object(
    'notificationId', v_notification.id,
    'userName', v_notification.user_name,
    'userEmail', v_notification.user_email,
    'fileName', v_notification.file_name,
    'fileType', v_notification.file_type,
    'submittedAt', v_notification.created_at
  );
  
  -- Call Edge Function
  PERFORM net.http_post(
    url := (SELECT current_setting('app.settings.edge_function_url') || '/send-award-notification'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := v_payload
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to resend email: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admins only)
GRANT EXECUTE ON FUNCTION public.resend_award_notification_email(UUID) TO authenticated;