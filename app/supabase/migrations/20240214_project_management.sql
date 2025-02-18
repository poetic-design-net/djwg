-- Create enum for task status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
    END IF;
END
$$;

-- Create roadmap table
CREATE TABLE IF NOT EXISTS roadmap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status task_status DEFAULT 'backlog',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    priority INTEGER DEFAULT 0
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'new',
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create forum posts (comments) table
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority INTEGER DEFAULT 0,
    due_date DATE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction tables for tags
CREATE TABLE IF NOT EXISTS roadmap_tags (
    roadmap_id UUID REFERENCES roadmap_items(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (roadmap_id, tag_id)
);

CREATE TABLE IF NOT EXISTS idea_tags (
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Add RLS policies if not exists
DO $$ 
BEGIN
    ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON roadmap_items;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON ideas;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON forum_posts;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON tags;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" ON roadmap_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON ideas
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON forum_topics
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON forum_posts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON tasks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access for authenticated users" ON tags
    FOR SELECT TO authenticated USING (true);

-- Create or replace function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_roadmap_items_updated_at ON roadmap_items;
DROP TRIGGER IF EXISTS update_ideas_updated_at ON ideas;
DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON forum_topics;
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Create triggers for updated_at
CREATE TRIGGER update_roadmap_items_updated_at
    BEFORE UPDATE ON roadmap_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
    BEFORE UPDATE ON forum_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
    BEFORE UPDATE ON forum_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert example data (only if tables are empty)
DO $$
BEGIN
    -- Example tags
    IF NOT EXISTS (SELECT 1 FROM tags LIMIT 1) THEN
        INSERT INTO tags (id, name, color)
        VALUES 
            ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Website', '#0ea5e9'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Design', '#f97316'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Backend', '#8b5cf6'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'Frontend', '#ef4444'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'Dringend', '#dc2626');
    END IF;

    -- Example roadmap items
    IF NOT EXISTS (SELECT 1 FROM roadmap_items LIMIT 1) THEN
        INSERT INTO roadmap_items (id, title, description, target_date, status, priority)
        VALUES
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0856',
                'Website Relaunch',
                'Komplette Überarbeitung der Website mit neuem Design und verbesserten Features',
                '2024-06-30',
                'in_progress',
                80
            ),
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0857',
                'Mobile App Entwicklung',
                'Entwicklung einer nativen Mobile App für iOS und Android',
                '2024-12-31',
                'backlog',
                60
            );

        -- Link tags to roadmap items
        INSERT INTO roadmap_tags (roadmap_id, tag_id)
        VALUES
            ('d290f1ee-6c54-4b01-90e6-d701748f0856', 'd290f1ee-6c54-4b01-90e6-d701748f0851'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0856', 'd290f1ee-6c54-4b01-90e6-d701748f0852');
    END IF;

    -- Example tasks
    IF NOT EXISTS (SELECT 1 FROM tasks LIMIT 1) THEN
        INSERT INTO tasks (id, title, description, status, priority, due_date)
        VALUES
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0858',
                'Homepage Design Review',
                'Review und Feedback zum neuen Homepage Design',
                'todo',
                70,
                '2024-03-01'
            ),
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0859',
                'API Dokumentation',
                'Erstellen einer detaillierten API Dokumentation',
                'in_progress',
                50,
                '2024-03-15'
            );

        -- Link tags to tasks
        INSERT INTO task_tags (task_id, tag_id)
        VALUES
            ('d290f1ee-6c54-4b01-90e6-d701748f0858', 'd290f1ee-6c54-4b01-90e6-d701748f0852'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0859', 'd290f1ee-6c54-4b01-90e6-d701748f0853');
    END IF;

    -- Example ideas
    IF NOT EXISTS (SELECT 1 FROM ideas LIMIT 1) THEN
        INSERT INTO ideas (id, title, description, category, status, votes)
        VALUES
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0860',
                'Dark Mode Implementation',
                'Einführung eines Dark Mode für bessere Benutzerfreundlichkeit',
                'Feature',
                'new',
                5
            ),
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0861',
                'Performance Optimierung',
                'Optimierung der Ladezeiten durch besseres Caching',
                'Verbesserung',
                'in_progress',
                8
            );

        -- Link tags to ideas
        INSERT INTO idea_tags (idea_id, tag_id)
        VALUES
            ('d290f1ee-6c54-4b01-90e6-d701748f0860', 'd290f1ee-6c54-4b01-90e6-d701748f0854'),
            ('d290f1ee-6c54-4b01-90e6-d701748f0861', 'd290f1ee-6c54-4b01-90e6-d701748f0855');
    END IF;

    -- Example forum topics and posts
    IF NOT EXISTS (SELECT 1 FROM forum_topics LIMIT 1) THEN
        INSERT INTO forum_topics (id, title, content, category, is_pinned)
        VALUES
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0862',
                'Willkommen im Team Forum',
                'Hier können wir uns über aktuelle Projekte austauschen und Ideen diskutieren.',
                'Ankündigungen',
                true
            ),
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0863',
                'Feedback zum neuen Design',
                'Lasst uns über das neue Website Design sprechen und Verbesserungsvorschläge sammeln.',
                'Diskussion',
                false
            );

        INSERT INTO forum_posts (id, topic_id, content)
        VALUES
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0864',
                'd290f1ee-6c54-4b01-90e6-d701748f0863',
                'Das neue Design sieht super aus! Besonders die neue Navigation ist viel intuitiver.'
            ),
            (
                'd290f1ee-6c54-4b01-90e6-d701748f0865',
                'd290f1ee-6c54-4b01-90e6-d701748f0863',
                'Stimme zu! Vielleicht könnten wir noch die Mobile-Ansicht etwas optimieren?'
            );
    END IF;
END $$;