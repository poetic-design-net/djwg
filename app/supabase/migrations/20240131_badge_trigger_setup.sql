-- Enable plpgsql if not already enabled
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- Grant necessary permissions to the trigger function
GRANT EXECUTE ON FUNCTION public.check_profile_completion() TO authenticated;

CREATE OR REPLACE FUNCTION public.check_profile_completion() 
RETURNS TRIGGER AS $$
DECLARE
    dj_badge_id uuid;
    required_fields_complete boolean;
    social_media_complete boolean;
BEGIN
    -- Get the DJ Level 1 badge id
    SELECT b.id INTO dj_badge_id 
    FROM public.badges b 
    WHERE b.slug = 'dj-level-1' 
    LIMIT 1;
    
    -- Check required fields (handle NULL values)
    required_fields_complete := (
        COALESCE(NEW.username, '') != ''
    );
    
    -- Check optional fields (need at least one from each category)
    social_media_complete := (
        NEW.social_links IS NOT NULL AND (
            COALESCE(NEW.social_links->>'instagram', '') != '' OR
            COALESCE(NEW.social_links->>'facebook', '') != '' OR
            COALESCE(NEW.social_links->>'soundcloud', '') != ''
        )
    );

    -- Check if profile is complete (handle NULL values)
    IF required_fields_complete AND 
       social_media_complete AND
       COALESCE(NEW.avatar_url, '') != '' AND
       COALESCE(NEW.bio, '') != '' AND
       COALESCE(NEW.phone, '') != '' AND
       COALESCE(NEW.address_street, '') != '' AND
       COALESCE(NEW.address_city, '') != '' AND
       COALESCE(NEW.address_zip, '') != '' AND
       COALESCE(NEW.address_country, '') != ''
    THEN
        -- Insert badge if not already assigned
        INSERT INTO public.user_badges (user_id, badge_id, assigned_reason)
        VALUES (NEW.id, dj_badge_id, 'Automatisch zugewiesen für 100% Profilfortschritt')
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger with proper timing
DROP TRIGGER IF EXISTS trigger_check_profile_completion ON public.profiles;
CREATE TRIGGER trigger_check_profile_completion
    AFTER UPDATE OF username, avatar_url, bio, phone, address_street, address_city, address_zip, address_country, social_links
    ON public.profiles
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION public.check_profile_completion();

-- Grant additional permissions that might be needed
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.badges TO authenticated;
GRANT INSERT ON public.user_badges TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;