import type { LayoutServerLoad } from './$types';
import { client } from '$lib/sanity/client';
import { footerSettingsQuery, type FooterSettings } from '$lib/sanity/queries/content';

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    // First handle Sanity preview state
    const preview = false; // Default preview state

    // Fetch footer settings
    const footerSettings = await client.fetch<FooterSettings>(footerSettingsQuery);

    // Then handle auth state, but don't block on it
    let user = null;
    let session = null;

    try {
      if (locals.supabase) {
        // Get session first
        const { data: sessionData } = await locals.supabase.auth.getSession();
        session = sessionData.session;

        // Only get user if we have a session
        if (session && locals.getUser) {
          user = await locals.getUser();
        }
      }
    } catch (error) {
      console.error('Non-blocking auth error:', error);
    }

    // Return data with auth state as optional
    return {
      user,
      session,
      preview,
      footerSettings
    };
  } catch (error) {
    console.error('Error in layout.server.ts:', error);
    // Return minimal data to keep the app functioning
    return {
      user: null,
      session: null,
      preview: false,
      footerSettings: null
    };
  }
};
