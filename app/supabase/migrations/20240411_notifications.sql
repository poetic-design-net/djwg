-- Erstelle notifications Tabelle
create table public.notifications (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users not null,
    type text not null,
    title text not null,
    message text not null,
    read boolean default false,
    archived boolean default false,
    metadata jsonb default '{}'::jsonb
);

-- Berechtigungen für notifications
alter table public.notifications enable row level security;

create policy "Users können ihre eigenen Benachrichtigungen sehen"
    on notifications for select
    using (auth.uid() = user_id);

create policy "Nur das System kann Benachrichtigungen erstellen"
    on notifications for insert
    to service_role
    with check (true);
create policy "Users können ihre Benachrichtigungen als gelesen markieren und archivieren"
    on notifications for update
    using (auth.uid() = user_id)
    with check (
        auth.uid() = user_id
        and (
            coalesce(
                current_setting('request.jwt.claims')::json->>'role',
                'authenticated'
            ) = 'authenticated'
            and (SELECT COUNT(*)
                FROM jsonb_each_text(to_jsonb(notifications.*) - 'read' - 'archived')
                WHERE key = ANY(ARRAY['user_id', 'type', 'title', 'message', 'metadata', 'created_at'])
                  AND value::text IS DISTINCT FROM ((to_jsonb(notifications.*) - 'read' - 'archived')->>key)::text
            ) = 0
        )
    );
    );

-- Indizes für bessere Performance
create index notifications_user_id_idx on notifications(user_id);
create index notifications_created_at_idx on notifications(created_at desc);
create index notifications_read_idx on notifications(read);

-- Trigger für Löschung alter gelesener Benachrichtigungen
create or replace function delete_old_read_notifications() returns trigger as $$
begin
    delete from notifications
    where read = true
    and created_at < now() - interval '30 days';
    return new;
end;
$$ language plpgsql;

create trigger cleanup_old_notifications
    after insert on notifications
    execute procedure delete_old_read_notifications();