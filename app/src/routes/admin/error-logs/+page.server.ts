import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ErrorLog, ErrorLogEventType } from '$lib/types/error-log';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
    const session = await locals.supabase.auth.getSession();
    
    if (!session.data.session?.user) {
        throw redirect(303, '/');
    }

    // Hole das Profil des aktuellen Benutzers
    const { data: profile } = await locals.supabase
        .from('profiles')
        .select('role')
        .eq('id', session.data.session.user.id)
        .single();

    // Prüfe ob der Benutzer Admin ist
    if (!profile?.role || profile.role !== 'admin') {
        throw redirect(303, '/');
    }

    const eventType = url.searchParams.get('eventType') as ErrorLogEventType | null;
    
    let query = locals.supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (eventType) {
        query = query.eq('event_type', eventType);
    }

    const { data: logs, error: dbError } = await query;

    if (dbError) {
        console.error('Fehler beim Laden der Error-Logs:', dbError);
        return {
            logs: [] as ErrorLog[],
            eventTypes: [] as ErrorLogEventType[]
        };
    }

    // Extrahiere unique event types aus den geladenen Logs
    const uniqueEventTypes = Array.from(new Set(
        logs?.map(log => log.event_type as ErrorLogEventType) || []
    ));

    return {
        logs: (logs || []) as ErrorLog[],
        eventTypes: uniqueEventTypes
    };
};