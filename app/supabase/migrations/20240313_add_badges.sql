-- Füge die beiden DJ Level Badges hinzu
INSERT INTO public.badges (id, name, description, slug, unlock_condition, unlock_reward, style)
VALUES
  -- DJ Level 1 Badge
  ('4d2e1bf7-37e7-4226-9239-f8a60f608900', 'DJ Level 1', 'Erste Schritte in der DJ Community', 'dj-level-1', 'Vollständiges Profil', 'Zugang zu 3 exklusiven Videos', '{"variant": "gold"}'),
  
  -- DJ Level 2 Badge (manuell zuweisbar)
  ('023cc4ab-9a20-45db-82d5-c248aacefe0a', 'DJ Level 2', 'Fortgeschrittener DJ Level', 'dj-level-2', 'Wird manuell zugewiesen (erfordert Level 1)', 'Zugang zu weiteren exklusiven Videos', '{"variant": "premium"}')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  slug = EXCLUDED.slug,
  unlock_condition = EXCLUDED.unlock_condition,
  unlock_reward = EXCLUDED.unlock_reward,
  style = EXCLUDED.style;