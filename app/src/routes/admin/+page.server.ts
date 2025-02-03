import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/profile';
import { isAdmin } from '$lib/config/admin.server';

export const load = async ({ locals }) => {
  const session = await locals.supabase.auth.getSession();
  
  if (!session.data.session?.user?.email || !isAdmin(session.data.session.user.email)) {
    throw redirect(303, '/');
  }

  const { data: users, error } = await locals.supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Benutzer:', error);
    return {
      users: [] as Profile[]
    };
  }

  return {
    users: users as Profile[]
  };
};