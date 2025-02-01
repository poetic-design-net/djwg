-- Insert DJ Level 1 badge
INSERT INTO public.badges (name, description, slug, style)
VALUES (
    'DJ Stufe 1',
    'Erreicht durch Vervollständigung des Profils zu 100%',
    'dj-level-1',
    '{"variant": "dj", "color": "#4CAF50", "borderStyle": "solid"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Create function to automatically assign DJ badge when profile reaches 100%
CREATE OR REPLACE FUNCTION public.check_profile_completion() 
RETURNS TRIGGER AS $$
DECLARE
    badge_id uuid;
    required_fields_complete boolean;
    social_media_complete boolean;
    effective_full_name text;
BEGIN
    -- Get the DJ Level 1 badge id
    SELECT id INTO badge_id FROM public.badges WHERE slug = 'dj-level-1' LIMIT 1;
    
    IF badge_id IS NULL THEN
        RAISE LOG 'DJ Level 1 badge not found in database';
        RETURN NEW;
    END IF;
    
    -- Use username as full_name if full_name is null
    effective_full_name := COALESCE(NEW.full_name, NEW.username);
    
    -- Check required fields (handle NULL values)
    required_fields_complete := (
        COALESCE(NEW.username, '') != '' AND 
        COALESCE(effective_full_name, '') != ''
    );
    
    -- Check optional fields (need at least one from each category)
    social_media_complete := (
        NEW.social_links IS NOT NULL AND (
            COALESCE(NEW.social_links->>'instagram', '') != '' OR
            COALESCE(NEW.social_links->>'facebook', '') != '' OR
            COALESCE(NEW.social_links->>'soundcloud', '') != ''
        )
    );
    
    -- Log current state for debugging
    RAISE LOG 'Profile check - Required fields: %, Social media: %', required_fields_complete, social_media_complete;
    RAISE LOG 'Profile data - username: %, effective_full_name: %, social_links: %', 
        COALESCE(NEW.username, 'NULL'), 
        COALESCE(effective_full_name, 'NULL'),
        COALESCE(NEW.social_links::text, 'NULL');
    
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
        -- Log attempt to insert badge
        RAISE LOG 'Attempting to assign badge % to user %', badge_id, NEW.id;
        
        -- Insert badge if not already assigned
        BEGIN
            INSERT INTO public.user_badges (user_id, badge_id)
            VALUES (NEW.id, badge_id)
            ON CONFLICT (user_id, badge_id) DO NOTHING;
            
            RAISE LOG 'Badge assignment successful';
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error assigning badge: %', SQLERRM;
        END;
    ELSE
        RAISE LOG 'Profile not complete - skipping badge assignment. Missing fields:';
        IF NOT required_fields_complete THEN
            RAISE LOG '- Required fields not complete';
        END IF;
        IF NOT social_media_complete THEN
            RAISE LOG '- Social media not complete';
        END IF;
        IF COALESCE(NEW.avatar_url, '') = '' THEN
            RAISE LOG '- Avatar URL missing';
        END IF;
        IF COALESCE(NEW.bio, '') = '' THEN
            RAISE LOG '- Bio missing';
        END IF;
        IF COALESCE(NEW.phone, '') = '' THEN
            RAISE LOG '- Phone missing';
        END IF;
        IF COALESCE(NEW.address_street, '') = '' THEN
            RAISE LOG '- Street missing';
        END IF;
        IF COALESCE(NEW.address_city, '') = '' THEN
            RAISE LOG '- City missing';
        END IF;
        IF COALESCE(NEW.address_zip, '') = '' THEN
            RAISE LOG '- ZIP missing';
        END IF;
        IF COALESCE(NEW.address_country, '') = '' THEN
            RAISE LOG '- Country missing';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_check_profile_completion ON public.profiles;
CREATE TRIGGER trigger_check_profile_completion
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_completion();