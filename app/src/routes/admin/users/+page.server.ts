import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Profile } from '$lib/types/profile';
import type { Badge, UserBadge } from '$lib/types/badge';

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

  // Hole alle Benutzerprofile
  const { data: users, error: usersError } = await locals.supabase
    .from('profiles')
    .select('*')
    .order('email', { ascending: true });

  if (usersError) {
    console.error('Fehler beim Laden der Benutzer:', usersError);
    return {
      users: [] as Profile[]
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
      users: (users || []) as Profile[],
      badges: [] as Badge[]
    };
  }

  // Hole alle User-Badge-Zuweisungen
  const { data: userBadges, error: userBadgesError } = await locals.supabase
    .from('user_badges')
    .select('*');

  if (userBadgesError) {
    console.error('Fehler beim Laden der User-Badges:', userBadgesError);
    return {
      users: (users || []) as Profile[],
      badges: (badges || []) as Badge[],
      userBadges: [] as UserBadge[]
    };
  }

  return {
    users: (users || []) as Profile[],
    badges: (badges || []) as Badge[],
    userBadges: (userBadges || []) as UserBadge[]
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

      console.log('Badge entfernen:', { userId, badgeId });

      if (!userId || !badgeId) {
        return fail(400, { message: 'UserId und BadgeId sind erforderlich' });
      }

      // Prüfe zuerst, ob das Badge existiert
      const { data: existingBadge, error: checkError } = await locals.supabase
        .from('user_badges')
        .select('*')
        .match({ user_id: userId, badge_id: badgeId })
        .single();

      if (checkError) {
        console.error('Fehler beim Prüfen des Badges:', checkError);
        return fail(500, { message: 'Fehler beim Prüfen des Badges', error: checkError });
      }

      if (!existingBadge) {
        console.error('Badge nicht gefunden:', { userId, badgeId });
        return fail(404, { message: 'Badge nicht gefunden' });
      }

      // Lösche das Badge
      const { error: deleteError } = await locals.supabase
        .from('user_badges')
        .delete()
        .match({ user_id: userId, badge_id: badgeId });

      if (deleteError) {
        console.error('Fehler beim Löschen des Badges:', deleteError);
        return fail(500, { message: 'Fehler beim Entfernen des Badges', error: deleteError });
      }

      // Validiere die Löschung
      const { data: checkAfterDelete, error: validateError } = await locals.supabase
        .from('user_badges')
        .select('*')
        .match({ user_id: userId, badge_id: badgeId });

      if (validateError) {
        console.error('Fehler beim Validieren der Löschung:', validateError);
      } else if (checkAfterDelete && checkAfterDelete.length > 0) {
        console.error('Badge wurde nicht korrekt gelöscht');
        return fail(500, { message: 'Badge konnte nicht entfernt werden' });
      }

      console.log('Badge erfolgreich entfernt');
      return {
        success: true,
        message: 'Badge erfolgreich entfernt'
      };

    } catch (error) {
      console.error('Unerwarteter Fehler beim Entfernen des Badges:', error);
      return fail(500, { message: 'Unerwarteter Fehler beim Entfernen des Badges', error });
    }
  }
};