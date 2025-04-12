import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Profile } from '$lib/types/profile';
import type { Badge, UserBadge } from '$lib/types/badge';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
  setHeaders({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
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

  // Hole alle Benutzerprofile mit den relevanten Feldern
  const { data: users, error: usersError } = await locals.supabase
    .from('profiles')
    .select(`
      id,
      email,
      username,
      full_name,
      avatar_url,
      auth_created_at,
      auth_last_sign_in_at
    `)
    .order('auth_created_at', { ascending: false }); // Neueste Benutzer zuerst

  if (usersError) {
    console.error('Fehler beim Laden der Benutzer:', usersError);
    return {
      users: [],
      badges: [],
      userBadges: []
    };
  }

  // Hole alle Badges
  const { data: badges, error: badgesError } = await locals.supabase
    .from('badges')
    .select('*')
    .order('name');

  if (badgesError) {
    console.error('Fehler beim Laden der Badges:', badgesError);
    return {
      users: users || [],
      badges: [],
      userBadges: []
    };
  }

  // Hole alle User-Badge-Zuweisungen
  const { data: userBadges, error: userBadgesError } = await locals.supabase
    .from('user_badges')
    .select('*');

  if (userBadgesError) {
    console.error('Fehler beim Laden der User-Badges:', userBadgesError);
    return {
      users: users || [],
      badges: badges || [],
      userBadges: []
    };
  }

  return {
    users: users || [],
    badges: badges || [],
    userBadges: userBadges || []
  };
};

export const actions = {
  assignBadge: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const badgeId = formData.get('badgeId') as string;

    if (!userId || !badgeId) {
      return fail(400, { message: 'UserId und BadgeId sind erforderlich' });
    }

    const { error } = await locals.supabase
      .from('user_badges')
      .insert([{ user_id: userId, badge_id: badgeId }]);

    if (error) {
      console.error('Fehler beim Zuweisen des Badges:', error);
      return fail(500, { message: 'Fehler beim Zuweisen des Badges', error });
    }

    return { success: true };
  },

  removeBadge: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const userId = formData.get('userId') as string;
      const badgeId = formData.get('badgeId') as string;

      if (!userId || !badgeId) {
        return fail(400, { message: 'UserId und BadgeId sind erforderlich' });
      }

      const { error: deleteError } = await locals.supabase
        .from('user_badges')
        .delete()
        .match({ user_id: userId, badge_id: badgeId });

      if (deleteError) {
        console.error('Fehler beim Löschen des Badges:', deleteError);
        return fail(500, { message: 'Fehler beim Entfernen des Badges', error: deleteError });
      }

      return {
        success: true,
        message: 'Badge erfolgreich entfernt'
      };

    } catch (error) {
      console.error('Unerwarteter Fehler beim Entfernen des Badges:', error);
      return fail(500, { message: 'Unerwarteter Fehler beim Entfernen des Badges', error });
    }
  },

  assignBulkBadges: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const userIds = JSON.parse(formData.get('userIds') as string) as string[];
      const badgeId = formData.get('badgeId') as string;

      if (!userIds?.length || !badgeId) {
        return fail(400, { message: 'UserIds und BadgeId sind erforderlich' });
      }

      // Hole existierende Zuweisungen für diese Badge-ID
      const { data: existingBadges } = await locals.supabase
        .from('user_badges')
        .select('user_id')
        .eq('badge_id', badgeId)
        .in('user_id', userIds);

      // Filtere Benutzer, die das Badge bereits haben
      const existingUserIds = new Set(existingBadges?.map(badge => badge.user_id) || []);
      const newUserIds = userIds.filter(id => !existingUserIds.has(id));

      if (newUserIds.length > 0) {
        const { error } = await locals.supabase
          .from('user_badges')
          .insert(newUserIds.map(userId => ({
            user_id: userId,
            badge_id: badgeId
          })));

        if (error) {
          return fail(500, { message: 'Fehler beim Zuweisen der Badges', error });
        }
      }

      return { success: true };
    } catch (error) {
      return fail(500, { message: 'Unerwarteter Fehler beim Zuweisen der Badges', error });
    }
  },

  removeBulkBadges: async ({ request, locals }) => {
    try {
      const formData = await request.formData();
      const userIds = JSON.parse(formData.get('userIds') as string) as string[];
      const badgeId = formData.get('badgeId') as string;

      if (!userIds?.length || !badgeId) {
        return fail(400, { message: 'UserIds und BadgeId sind erforderlich' });
      }

      const { error } = await locals.supabase
        .from('user_badges')
        .delete()
        .eq('badge_id', badgeId)
        .in('user_id', userIds);

      if (error) {
        console.error('Fehler beim Entfernen der Badges:', error);
        return fail(500, { message: 'Fehler beim Entfernen der Badges', error });
      }

      return { success: true };
    } catch (error) {
      console.error('Unerwarteter Fehler beim Entfernen der Badges:', error);
      return fail(500, { message: 'Unerwarteter Fehler beim Entfernen der Badges', error });
    }
  }
};