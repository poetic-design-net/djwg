-- Create badges table
create table public.badges (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_badges junction table
create table public.user_badges (
    user_id uuid references public.profiles(id) on delete cascade,
    badge_id uuid references public.badges(id) on delete cascade,
    assigned_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (user_id, badge_id)
);

-- Add RLS policies
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Badges policies (only admins can manage badges)
create policy "Admins can do everything with badges"
    on public.badges
    as permissive
    for all
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Everyone can view badges
create policy "Everyone can view badges"
    on public.badges
    as permissive
    for select
    to authenticated
    using (true);

-- User badges policies
create policy "Admins can manage user badges"
    on public.user_badges
    as permissive
    for all
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Users can view their own badges
create policy "Users can view their own badges"
    on public.user_badges
    as permissive
    for select
    to authenticated
    using (auth.uid() = user_id);