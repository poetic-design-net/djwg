create table if not exists public.course_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  lesson_id text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure each user can only have one progress record per lesson
  unique(user_id, course_id, lesson_id)
);

-- Set up RLS policies
alter table public.course_progress enable row level security;

create policy "Users can read their own course progress"
  on public.course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own course progress"
  on public.course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own course progress"
  on public.course_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own course progress"
  on public.course_progress for delete
  using (auth.uid() = user_id);