-- Create badges table for storing badge definitions
create table if not exists public.badges (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    slug text unique not null,
    icon_url text,
    style jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Drop existing user_badges table if exists
DROP TABLE IF EXISTS public.user_badges;

-- Create user_badges table for storing badge assignments
CREATE TABLE public.user_badges (
    user_id uuid references auth.users(id) on delete cascade,
    badge_id uuid references public.badges(id) on delete cascade,
    assigned_at timestamptz default now(),
    assigned_reason text,
    primary key (user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Badges are viewable by everyone"
    ON public.badges FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert badges"
    ON public.badges FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update badges"
    ON public.badges FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id);

-- Allow system triggers and admins to insert badges
CREATE POLICY "System and admins can assign badges"
    ON public.user_badges FOR INSERT
    WITH CHECK (
        -- Allow system triggers
        (current_setting('role', true) = 'rls_restricted') OR
        -- Or admin users
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update badge assignments"
    ON public.user_badges FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default badges
INSERT INTO public.badges (id, name, description, slug, style)
VALUES
    ('3003110f-3664-4a05-b183-955f5f3f7785', 'Premium', 'Premium-Mitglied der Community', 'premium',
    '{"variant": "premium", "color": "#50C878", "borderStyle": "solid"}'::jsonb),
    ('4d2e1bf7-37e7-4226-9239-f8a60f608900', 'DJ Stufe 1', 'Erreicht durch Vervollständigung des Profils zu 100%', 'dj-level-1',
    '{"variant": "dj", "color": "#4CAF50", "borderStyle": "solid"}'::jsonb);