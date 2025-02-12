-- Drop existing policies
drop policy if exists "Admins can read all error logs" on public.error_logs;
drop policy if exists "Admins can insert error logs" on public.error_logs;
drop policy if exists "Authenticated users can insert error logs" on public.error_logs;
drop policy if exists "Anyone can insert error logs" on public.error_logs;

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