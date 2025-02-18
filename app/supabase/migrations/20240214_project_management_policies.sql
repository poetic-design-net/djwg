-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON roadmap_items;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON roadmap_items;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON ideas;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON ideas;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON forum_posts;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON forum_posts;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON tags;
DROP POLICY IF EXISTS "Allow write access for authenticated users" ON tags;
DROP POLICY IF EXISTS "Allow write access for junction tables" ON roadmap_tags;
DROP POLICY IF EXISTS "Allow write access for junction tables" ON idea_tags;
DROP POLICY IF EXISTS "Allow write access for junction tables" ON task_tags;

-- Create base policies for all tables
CREATE POLICY "Allow full access for authenticated users" ON roadmap_items
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON ideas
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON forum_topics
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON forum_posts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON tasks
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON tags
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Junction table policies
CREATE POLICY "Allow full access for authenticated users" ON roadmap_tags
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON idea_tags
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow full access for authenticated users" ON task_tags
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS bypass for admin role
DO $$
BEGIN
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'roadmap_items');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'ideas');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'forum_topics');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'forum_posts');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'tasks');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'tags');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'roadmap_tags');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'idea_tags');
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', 'task_tags');
END $$;

-- Create helper function for incrementing votes
CREATE OR REPLACE FUNCTION increment_idea_votes(idea_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ideas
    SET votes = votes + 1
    WHERE id = idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;