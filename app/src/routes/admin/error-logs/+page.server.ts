import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import Logger from '$lib/services/logger';

export const load: PageServerLoad = async ({ locals }) => {
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

  try {
    const last7Days = await Logger.getErrorStats(7);
    const last30Days = await Logger.getErrorStats(30);

    if (last7Days === null || last30Days === null) {
      // Bei Fehlern leere Statistiken zurückgeben
      return {
        stats: {
          last7Days: {},
          last30Days: {}
        },
        recentLogs: []
      };
    }

    // Hole die letzten 100 Error Logs aus Supabase
    const { data: recentLogs, error: logsError } = await locals.supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('Error fetching recent logs:', logsError);
      return {
        stats: {
          last7Days,
          last30Days
        },
        recentLogs: []
      };
    }

    return {
      stats: {
        last7Days,
        last30Days
      },
      recentLogs: recentLogs || []
    };
  } catch (err) {
    console.error('Error loading error logs:', err);
    // Bei einem unerwarteten Fehler leere Daten zurückgeben statt redirect
    return {
      stats: {
        last7Days: {},
        last30Days: {}
      },
      recentLogs: []
    };
  }
};