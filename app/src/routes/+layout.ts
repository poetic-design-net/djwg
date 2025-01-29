import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
interface LayoutData {
  session: any;
  user: any;
  preview: boolean;
  navigation: any[];
  pages: Record<string, any>;
  footerSettings: any;
}

interface LoadParams {
  fetch: typeof window.fetch;
  data: LayoutData;
  depends: (dep: string) => void;
}

export const load = async ({ fetch, data, depends }: LoadParams) => {
  depends('supabase:auth');
  depends('app:navigation');
  depends('app:page');

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
        preview: data.preview,
        navigation: data.navigation,
        pages: data.pages,
        footerSettings: data.footerSettings
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
      preview: data.preview,
      navigation: data.navigation,
      pages: data.pages,
      footerSettings: data.footerSettings
    };
  } catch (error) {
    console.error('Error in layout load:', error);
    return {
      supabase,
      session: null,
      user: null,
      preview: data.preview,
      navigation: data.navigation,
      footerSettings: data.footerSettings
    };
  }
};
