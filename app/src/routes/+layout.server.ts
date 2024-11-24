import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient } from '@supabase/supabase-js';
import { client } from '$lib/sanity/client';
import { footerSettingsQuery, type FooterSettings } from '$lib/sanity/queries/content';
import { navigationQuery, transformNavigationData } from '$lib/sanity/queries/navigation';
import { themeSettingsQuery, type ThemeSettings } from '$lib/sanity/queries/theme';
import type { MenuItems } from '$lib/types/menu';

interface Locals extends LoaderLocals {
  supabase: SupabaseClient;
  getUser(): Promise<any>;
}

export const load = async ({ locals }: { locals: Locals }) => {
  try {
    // First handle Sanity preview state
    const preview = false; // Default preview state

    // Fetch footer settings, navigation, and theme settings in parallel
    const [footerSettings, rawNavigation, themeSettings] = await Promise.all([
      client.fetch<FooterSettings>(footerSettingsQuery),
      client.fetch(navigationQuery),
      client.fetch<ThemeSettings>(themeSettingsQuery)
    ]);

    // Transform navigation data
    const navigation = transformNavigationData(rawNavigation);
    console.log('Layout server navigation:', navigation);

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
      footerSettings,
      navigation,
      themeSettings
    };
  } catch (error) {
    console.error('Error in layout.server.ts:', error);
    // Return minimal data to keep the app functioning
    return {
      user: null,
      session: null,
      preview: false,
      footerSettings: null,
      navigation: {
        workshops: undefined,
        join: undefined,
        about: undefined
      },
      themeSettings: null
    };
  }
};
