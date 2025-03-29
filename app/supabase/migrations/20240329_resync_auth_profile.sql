-- Re-synchronisiere die Auth-Daten in die Profile-Tabelle
UPDATE profiles
SET 
  auth_created_at = auth.users.created_at,
  auth_last_sign_in_at = auth.users.last_sign_in_at
FROM auth.users
WHERE profiles.id = auth.users.id;