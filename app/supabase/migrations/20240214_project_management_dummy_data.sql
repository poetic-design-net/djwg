-- Dummy-Daten einfügen
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Die erste verfügbare User-ID nehmen
    SELECT id INTO current_user_id
    FROM auth.users
    LIMIT 1;
    
    IF current_user_id IS NULL THEN
        -- Falls kein User existiert, einen UUID generieren
        current_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;

    -- Example tags
    INSERT INTO tags (id, name, color)
    VALUES 
        ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Website', '#0ea5e9'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Design', '#f97316'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Backend', '#8b5cf6'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'Frontend', '#ef4444'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'Dringend', '#dc2626')
    ON CONFLICT (id) DO NOTHING;

    -- Example roadmap items
    INSERT INTO roadmap_items (id, title, description, target_date, status, priority, created_by)
    VALUES
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0856',
            'Website Relaunch',
            'Komplette Überarbeitung der Website mit neuem Design und verbesserten Features',
            '2024-06-30',
            'in_progress',
            80,
            current_user_id
        ),
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0857',
            'Mobile App Entwicklung',
            'Entwicklung einer nativen Mobile App für iOS und Android',
            '2024-12-31',
            'backlog',
            60,
            current_user_id
        )
    ON CONFLICT (id) DO NOTHING;

    -- Link tags to roadmap items
    INSERT INTO roadmap_tags (roadmap_id, tag_id)
    VALUES
        ('d290f1ee-6c54-4b01-90e6-d701748f0856', 'd290f1ee-6c54-4b01-90e6-d701748f0851'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0856', 'd290f1ee-6c54-4b01-90e6-d701748f0852')
    ON CONFLICT DO NOTHING;

    -- Example tasks
    INSERT INTO tasks (id, title, description, status, priority, due_date, created_by)
    VALUES
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0858',
            'Homepage Design Review',
            'Review und Feedback zum neuen Homepage Design',
            'todo',
            70,
            '2024-03-01',
            current_user_id
        ),
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0859',
            'API Dokumentation',
            'Erstellen einer detaillierten API Dokumentation',
            'in_progress',
            50,
            '2024-03-15',
            current_user_id
        )
    ON CONFLICT (id) DO NOTHING;

    -- Link tags to tasks
    INSERT INTO task_tags (task_id, tag_id)
    VALUES
        ('d290f1ee-6c54-4b01-90e6-d701748f0858', 'd290f1ee-6c54-4b01-90e6-d701748f0852'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0859', 'd290f1ee-6c54-4b01-90e6-d701748f0853')
    ON CONFLICT DO NOTHING;

    -- Example ideas
    INSERT INTO ideas (id, title, description, category, status, votes, created_by)
    VALUES
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0860',
            'Dark Mode Implementation',
            'Einführung eines Dark Mode für bessere Benutzerfreundlichkeit',
            'Feature',
            'new',
            5,
            current_user_id
        ),
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0861',
            'Performance Optimierung',
            'Optimierung der Ladezeiten durch besseres Caching',
            'Verbesserung',
            'in_progress',
            8,
            current_user_id
        )
    ON CONFLICT (id) DO NOTHING;

    -- Link tags to ideas
    INSERT INTO idea_tags (idea_id, tag_id)
    VALUES
        ('d290f1ee-6c54-4b01-90e6-d701748f0860', 'd290f1ee-6c54-4b01-90e6-d701748f0854'),
        ('d290f1ee-6c54-4b01-90e6-d701748f0861', 'd290f1ee-6c54-4b01-90e6-d701748f0855')
    ON CONFLICT DO NOTHING;

    -- Example forum topics and posts
    INSERT INTO forum_topics (id, title, content, category, is_pinned, created_by)
    VALUES
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0862',
            'Willkommen im Team Forum',
            'Hier können wir uns über aktuelle Projekte austauschen und Ideen diskutieren.',
            'Ankündigungen',
            true,
            current_user_id
        ),
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0863',
            'Feedback zum neuen Design',
            'Lasst uns über das neue Website Design sprechen und Verbesserungsvorschläge sammeln.',
            'Diskussion',
            false,
            current_user_id
        )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO forum_posts (id, topic_id, content, created_by)
    VALUES
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0864',
            'd290f1ee-6c54-4b01-90e6-d701748f0863',
            'Das neue Design sieht super aus! Besonders die neue Navigation ist viel intuitiver.',
            current_user_id
        ),
        (
            'd290f1ee-6c54-4b01-90e6-d701748f0865',
            'd290f1ee-6c54-4b01-90e6-d701748f0863',
            'Stimme zu! Vielleicht könnten wir noch die Mobile-Ansicht etwas optimieren?',
            current_user_id
        )
    ON CONFLICT (id) DO NOTHING;

    -- Bestätigung ausgeben
    RAISE NOTICE 'Dummy-Daten wurden erfolgreich eingefügt.';
END
$$;