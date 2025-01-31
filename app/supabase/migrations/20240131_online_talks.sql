-- Create online_talks table
create table if not exists public.online_talks (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    date timestamptz not null,
    link text not null,
    password text not null,
    visible_from_hours integer not null default 24,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.online_talks enable row level security;

-- Create policies
create policy "Online talks are viewable by authenticated users"
    on public.online_talks for select
    to authenticated
    using (true);

create policy "Only admins can insert online talks"
    on public.online_talks for insert
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Only admins can update online talks"
    on public.online_talks for update
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Only admins can delete online talks"
    on public.online_talks for delete
    to authenticated
    using (
        exists (
            select 1
            from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );