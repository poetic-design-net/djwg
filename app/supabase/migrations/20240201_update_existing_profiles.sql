-- Aktualisiere bestehende Profile mit den Daten aus den Benutzer-Metadaten
WITH user_data AS (
    SELECT 
        id,
        COALESCE(
            raw_user_meta_data->'raw_user_meta_data'->'raw_user_meta_data'->>'first_name',
            raw_user_meta_data->'raw_user_meta_data'->>'first_name',
            raw_user_meta_data->>'first_name'
        ) as first_name,
        COALESCE(
            raw_user_meta_data->'raw_user_meta_data'->'raw_user_meta_data'->>'last_name',
            raw_user_meta_data->'raw_user_meta_data'->>'last_name',
            raw_user_meta_data->>'last_name'
        ) as last_name
    FROM auth.users
    WHERE raw_user_meta_data IS NOT NULL
)
UPDATE public.profiles p
SET 
    first_name = ud.first_name,
    last_name = ud.last_name,
    full_name = TRIM(COALESCE(ud.first_name, '') || ' ' || COALESCE(ud.last_name, ''))
FROM user_data ud
WHERE p.id = ud.id
AND (ud.first_name IS NOT NULL OR ud.last_name IS NOT NULL);