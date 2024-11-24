import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  // Initialize Supabase client
  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });

  try {
    // Get session on client side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return {
        supabase,
        session: null,
        user: null,
        preview: data.preview
      };
    }

    // Get user if session exists
    let user = data.user;
    if (session && !user) {
      const { data: { user: sessionUser }, error: userError } = await supabase.auth.getUser();
      if (!userError) {
        user = sessionUser;
      } else {
        console.error('Error getting user:', userError);
      }
    }

    return {
      supabase,
      session,
      user,
      preview: data.preview
    };
  } catch (error) {
    console.error('Error in layout load:', error);
    return {
      supabase,
      session: null,
      user: null,
      preview: data.preview
    };
  }
};
