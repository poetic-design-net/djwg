import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Profile } from '$lib/types/profile';

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

  // Für Admins: Hole alle Benutzerprofile
  const { data: users, error } = await locals.supabase
    .from('profiles')
    .select('*')
    .order('email', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    return {
      users: [] as Profile[]
    };
  }

  return {
    users: (users || []) as Profile[]
  };
};