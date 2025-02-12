-- Create error_logs table
create table public.error_logs (
    id uuid primary key default uuid_generate_v4(),
    level text not null check (level in ('info', 'warn', 'error')),
    message text not null,
    context jsonb,
    stack text,
    url text,
    method text,
    route_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id)
);

-- Set up RLS policies
alter table public.error_logs enable row level security;

-- Allow public to insert logs (including non-authenticated users)
create policy "Anyone can insert error logs"
on public.error_logs for insert
to public
with check (true);

-- Only admins can read logs
create policy "Admins can read all error logs"
on public.error_logs for select
to authenticated
using (
    exists (
        select 1 
        from public.profiles 
        where profiles.id = auth.uid() 
        and profiles.role = 'admin'
    )
);

-- Create index for better query performance
create index error_logs_created_at_idx on public.error_logs (created_at desc);
create index error_logs_level_idx on public.error_logs (level);