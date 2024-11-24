import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity/client';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';

// Sets the client to be used by `loadQuery` when fetching data on the server.
setServerClient(serverClient);

// Sanity preview handler - must be first
const sanityHandler: Handle = createRequestHandler();

// Supabase auth handler - comes after Sanity
const supabaseHandler: Handle = async ({ event, resolve }) => {
  try {
    // Create Supabase client for each request
    event.locals.supabase = createSupabaseServerClient({
      supabaseUrl: PUBLIC_SUPABASE_URL,
      supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
      event,
    });

    // Get session for each request
    const { data: { session } } = await event.locals.supabase.auth.getSession();

    // Get verified user for each request
    event.locals.getUser = async () => {
      try {
        // Only attempt to get user if we have a session
        if (!session) {
          return null;
        }

        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          return null;
        }

        // Only return user if they are properly authenticated
        return user?.aud === 'authenticated' ? user : null;
      } catch (error) {
        console.error('Error in getUser:', error);
        return null;
      }
    };

    // Handle the request
    return await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      }
    });
  } catch (error) {
    console.error('Error in Supabase handler:', error);
    // Continue with the request even if Supabase fails
    return await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      }
    });
  }
};

// Combine handlers with Sanity first, then auth
export const handle = sequence(sanityHandler, supabaseHandler);
