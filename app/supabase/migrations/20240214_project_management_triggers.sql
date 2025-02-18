-- Create function to set created_by from auth.uid()
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_roadmap_created_by ON roadmap_items;
DROP TRIGGER IF EXISTS set_ideas_created_by ON ideas;
DROP TRIGGER IF EXISTS set_forum_topics_created_by ON forum_topics;
DROP TRIGGER IF EXISTS set_forum_posts_created_by ON forum_posts;
DROP TRIGGER IF EXISTS set_tasks_created_by ON tasks;

-- Create triggers to automatically set created_by
CREATE TRIGGER set_roadmap_created_by
    BEFORE INSERT ON roadmap_items
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_ideas_created_by
    BEFORE INSERT ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_forum_topics_created_by
    BEFORE INSERT ON forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_forum_posts_created_by
    BEFORE INSERT ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

CREATE TRIGGER set_tasks_created_by
    BEFORE INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

-- Add stored procedure for voting
CREATE OR REPLACE FUNCTION vote_for_idea(idea_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS
$$
BEGIN
    UPDATE ideas
    SET votes = votes + 1
    WHERE id = idea_id
    AND NOT EXISTS (
        SELECT 1
        FROM idea_votes
        WHERE idea_id = vote_for_idea.idea_id
        AND user_id = auth.uid()
    );

    INSERT INTO idea_votes (idea_id, user_id)
    VALUES (idea_id, auth.uid())
    ON CONFLICT DO NOTHING;
END;
$$;

-- Create idea_votes table to track who has voted
CREATE TABLE IF NOT EXISTS idea_votes (
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (idea_id, user_id)
);

-- Enable RLS for idea_votes
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;

-- Add policies for idea_votes
CREATE POLICY "Allow read access for authenticated users" ON idea_votes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for authenticated users" ON idea_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);