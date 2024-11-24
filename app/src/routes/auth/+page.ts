import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface AuthPageData {
  supabase: SupabaseClient;
  user: User | null;
}

export const load = async ({ parent }: { parent: () => Promise<AuthPageData> }) => {
  try {
    const parentData = await parent();
    
    // Ensure we have a valid Supabase instance
    if (!parentData.supabase) {
      console.error('No Supabase client available');
      return {
        supabase: null,
        user: null
      };
    }

    // Get session first
    const { data: { session }, error: sessionError } = await parentData.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return {
        supabase: parentData.supabase,
        user: null
      };
    }

    // If no session, return early
    if (!session) {
      return {
        supabase: parentData.supabase,
        user: null
      };
    }

    // Get user only if we have a session
    const { data: { user }, error: userError } = await parentData.supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return {
        supabase: parentData.supabase,
        user: null
      };
    }

    // Return verified user state
    return {
      supabase: parentData.supabase,
      user: user?.aud === 'authenticated' ? user : null
    };

  } catch (error) {
    console.error('Error in auth page load:', error);
    return {
      supabase: null,
      user: null
    };
  }
};
