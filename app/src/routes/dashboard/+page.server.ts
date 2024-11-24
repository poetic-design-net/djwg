import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  try {
    // Get session and user
    const session = locals.supabase ? (await locals.supabase.auth.getSession()).data.session : null;
    const user = await locals.getUser();
    
    // Redirect if not authenticated
    if (!session || !user) {
      throw redirect(303, '/auth');
    }

    return {
      user,
      session
    };
  } catch (error) {
    // If error is not a redirect, redirect to auth
    if (!(error instanceof Response && error.status === 303)) {
      console.error('Error in dashboard load:', error);
      throw redirect(303, '/auth');
    }
    throw error;
  }
};