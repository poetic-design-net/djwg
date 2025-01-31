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

-- Create user_badges table for storing badge assignments
create table if not exists public.user_badges (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    badge_id uuid references public.badges(id) on delete cascade,
    assigned_at timestamptz default now(),
    assigned_by uuid references auth.users(id),
    assigned_reason text
);

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Create policies
create policy "Badges are viewable by everyone"
    on public.badges for select
    to authenticated
    using (true);

create policy "Only admins can insert badges"
    on public.badges for insert
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Only admins can update badges"
    on public.badges for update
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Users can view their own badges"
    on public.user_badges for select
    using (auth.uid() = user_id);

create policy "Only admins can assign badges"
    on public.user_badges for insert
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Only admins can update badge assignments"
    on public.user_badges for update
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Insert default badges
INSERT INTO public.badges (id, name, description, slug, style)
VALUES
    ('3003110f-3664-4a05-b183-955f5f3f7785', 'Premium', 'Premium-Mitglied der Community', 'premium',
    '{"variant": "premium", "color": "#50C878", "borderStyle": "solid"}'::jsonb);

-- Assign badge to test user (optional, usually done through the admin interface)
-- INSERT INTO public.user_badges (user_id, badge_id)
-- VALUES ('your-test-user-id', '3003110f-3664-4a05-b183-955f5f3f7785');