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
    // Database Statistics
    const stats = await Promise.allSettled([
      // User Statistics
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      
      // Badge Statistics - Zähle eindeutige Badge-Zuweisungen
      supabaseAdmin.from('user_badges').select('user_id', { count: 'exact', head: true }),
      
      // Subscription Statistics
      supabaseAdmin.from('nextlevel_subscriptions').select('id', { count: 'exact', head: true }),
      
      // Recent Users (last 7 days)
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Active Subscriptions
      supabaseAdmin
        .from('nextlevel_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

    // Recent Activity - letzte 50 Einträge
    const { data: recentUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, avatar_url')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentSubscriptions } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .select(`
        id, 
        status, 
        plan_type, 
        created_at,
        profiles!inner(email, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Badge Statistics - Detaillierte Aufschlüsselung mit Namen
    const { data: badgeStats } = await supabaseAdmin
      .from('user_badges')
      .select(`
        badge_id,
        badges!inner(name, description, slug, icon_url)
      `);

    // Gruppiere Badge-Statistiken nach badge_id
    const badgeDistribution = badgeStats?.reduce((acc: Record<string, { name: string; description?: string; slug?: string; icon_url?: string; count: number }>, item) => {
      const badgeId = item.badge_id;
      const badge = Array.isArray(item.badges) ? item.badges[0] : item.badges;
      
      if (!acc[badgeId]) {
        acc[badgeId] = {
          name: badge?.name || `Badge ${badgeId.substring(0, 8)}...`,
          description: badge?.description,
          slug: badge?.slug,
          icon_url: badge?.icon_url,
          count: 0
        };
      }
      acc[badgeId].count++;
      return acc;
    }, {}) || {};

    // Sortiere nach Anzahl (absteigend) und formatiere für die Anzeige
    const sortedBadgeStats = Object.entries(badgeDistribution)
      .map(([id, stats]) => ({ 
        id, 
        ...stats
      }))
      .sort((a, b) => b.count - a.count);

    return {
      statistics: {
        totalUsers: stats[0].status === 'fulfilled' ? stats[0].value.count || 0 : 0,
        totalBadges: stats[1].status === 'fulfilled' ? stats[1].value.count || 0 : 0,
        totalSubscriptions: stats[2].status === 'fulfilled' ? stats[2].value.count || 0 : 0,
        recentUsers: stats[3].status === 'fulfilled' ? stats[3].value.count || 0 : 0,
        activeSubscriptions: stats[4].status === 'fulfilled' ? stats[4].value.count || 0 : 0,
      },
      recentActivity: {
        users: recentUsers || [],
        subscriptions: recentSubscriptions || []
      },
      badgeDistribution: sortedBadgeStats
    };
  } catch (error) {
    console.error('Fehler beim Laden der Database-Statistiken:', error);
    return {
      statistics: {
        totalUsers: 0,
        totalBadges: 0,
        totalSubscriptions: 0,
        recentUsers: 0,
        activeSubscriptions: 0,
      },
      recentActivity: {
        users: [],
        subscriptions: []
      },
      badgeDistribution: []
    };
  }
};
