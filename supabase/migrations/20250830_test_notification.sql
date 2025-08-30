-- Test-Notification erstellen (für Supabase SQL Editor)
-- Verwende eine existierende User ID aus deiner Datenbank

-- Option 1: Finde einen Admin-User und verwende dessen ID
DO $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_user_email TEXT;
BEGIN
  -- Hole den ersten Admin-User
  SELECT u.id, COALESCE(p.username, u.email), u.email
  INTO v_user_id, v_user_name, v_user_email
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.role = 'admin'
  LIMIT 1;
  
  -- Falls kein Admin gefunden, nimm irgendeinen User
  IF v_user_id IS NULL THEN
    SELECT u.id, COALESCE(p.username, u.email), u.email
    INTO v_user_id, v_user_name, v_user_email
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LIMIT 1;
  END IF;
  
  -- Erstelle Test-Notification
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.award_notifications (
      submission_id,
      user_id,
      user_name,
      user_email,
      file_name,
      file_type,
      file_size,
      priority
    ) VALUES (
      'test-' || gen_random_uuid()::text,
      v_user_id,
      v_user_name || ' (TEST)',
      v_user_email,
      'test-video-' || to_char(NOW(), 'HH24-MI-SS') || '.mp4',
      'video/mp4',
      50000000,
      'high'
    );
    
    RAISE NOTICE 'Test-Notification erstellt für User: %', v_user_name;
  ELSE
    RAISE NOTICE 'Kein User gefunden - bitte erst einen User anlegen';
  END IF;
END $$;

-- Zeige alle Notifications zur Überprüfung
SELECT 
  id,
  user_name,
  file_name,
  status,
  priority,
  created_at
FROM public.award_notifications
ORDER BY created_at DESC
LIMIT 10;