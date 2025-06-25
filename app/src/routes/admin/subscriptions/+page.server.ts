import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabase/admin';

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
    // Lade alle Subscriptions mit Benutzerinformationen
    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .select(`
        *,
        profiles!inner(
          id,
          email,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (subscriptionsError) {
      console.error('Fehler beim Laden der Subscriptions:', subscriptionsError);
    }

    // Lade Subscription-Statistiken
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .select('status, plan_type')
      .not('status', 'eq', 'incomplete');

    if (statsError) {
      console.error('Fehler beim Laden der Statistiken:', statsError);
    }

    // Berechne Statistiken
    const totalSubscriptions = stats?.length || 0;
    const activeSubscriptions = stats?.filter(s => s.status === 'active').length || 0;
    const canceledSubscriptions = stats?.filter(s => s.status === 'canceled').length || 0;
    const trialingSubscriptions = stats?.filter(s => s.status === 'trialing').length || 0;

    const planStats = {
      monthly: stats?.filter(s => s.plan_type === 'monthly').length || 0,
      quarterly: stats?.filter(s => s.plan_type === 'quarterly').length || 0,
      yearly: stats?.filter(s => s.plan_type === 'yearly').length || 0
    };

    // Berechne MRR (Monthly Recurring Revenue)
    const planPrices = { monthly: 19.99, quarterly: 16.66, yearly: 14.99 }; // Monatlicher Wert
    const mrr = (planStats.monthly * planPrices.monthly) + 
                (planStats.quarterly * planPrices.quarterly) + 
                (planStats.yearly * planPrices.yearly);

    return {
      subscriptions: subscriptions || [],
      statistics: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        trialing: trialingSubscriptions,
        planStats,
        mrr: Math.round(mrr * 100) / 100
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden der Admin-Daten:', error);
    return {
      subscriptions: [],
      statistics: {
        total: 0,
        active: 0,
        canceled: 0,
        trialing: 0,
        planStats: { monthly: 0, quarterly: 0, yearly: 0 },
        mrr: 0
      }
    };
  }
};
