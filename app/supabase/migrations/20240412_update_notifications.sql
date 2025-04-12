-- Füge archived Spalte hinzu
alter table if exists public.notifications
add column if not exists archived boolean default false;

-- Aktualisiere die Update-Policy
drop policy if exists "Users können ihre Benachrichtigungen als gelesen markieren" on notifications;

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

-- Index für archived Spalte
create index if not exists notifications_archived_idx on notifications(archived);

-- Aktualisiere den Cleanup-Trigger
create or replace function delete_old_read_notifications() returns trigger as $$
begin
    -- Lösche gelesene UND archivierte Benachrichtigungen nach 30 Tagen
    delete from notifications
    where (read = true or archived = true)
    and created_at < now() - interval '30 days';
    return new;
end;
$$ language plpgsql;