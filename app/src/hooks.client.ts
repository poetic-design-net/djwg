import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import { invalidate } from '$app/navigation';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    event.locals.supabase = createSupabaseLoadClient({
      supabaseUrl: PUBLIC_SUPABASE_URL,
      supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
      event,
      serverSession: null
    });

    // Helper that returns verified user
    event.locals.getUser = async () => {
      try {
        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user in client hook:', error);
          return null;
        }

        return user?.aud === 'authenticated' ? user : null;
      } catch (error) {
        console.error('Error in client getUser:', error);
        return null;
      }
    };

    // Handle auth state changes
    try {
      event.locals.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Invalidate all data to refresh auth state
          invalidate(() => true);
        }
      });
    } catch (error) {
      console.error('Error setting up auth state change handler:', error);
    }

    return resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      },
    });
  } catch (error) {
    console.error('Error in client hook:', error);
    // Still try to resolve the request even if Supabase setup fails
    return resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      },
    });
  }
};
