import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient } from '@supabase/supabase-js';
import { client } from '$lib/sanity/client';
import { footerSettingsQuery, type FooterSettings } from '$lib/sanity/queries/content';
import { navigationQuery, transformNavigationData } from '$lib/sanity/queries/navigation';
import { themeSettingsQuery, type ThemeSettings } from '$lib/sanity/queries/theme';
import { pagesQuery, transformPagesData } from '$lib/sanity/queries/pages';
import type { MenuItems } from '$lib/types/menu';

interface Locals extends LoaderLocals {
  supabase: SupabaseClient;
  getUser(): Promise<any>;
}

export const load = async ({ locals, depends, url }: { locals: Locals; depends: (dep: string) => void; url: URL }) => {

  
  // Deklariere die Abhängigkeiten
  depends('app:navigation');
  depends('app:page');

  try {
    // First handle Sanity preview state
    const preview = false; // Default preview state

    // Fetch footer settings, navigation, theme settings, and pages in parallel
    const [footerSettings, rawNavigation, themeSettings, rawPages] = await Promise.all([
      client.fetch<FooterSettings>(footerSettingsQuery),
      client.fetch(navigationQuery),
      client.fetch<ThemeSettings>(themeSettingsQuery),
      client.fetch(pagesQuery)
    ]);

    // Transform navigation data and pages data
    const navigation = transformNavigationData(rawNavigation);
    const pages = transformPagesData(rawPages);

    // Debug-Ausgaben
    console.log('🔄 Layout Server Load:', {
      url: url.pathname,
      navigationItems: navigation.length,
      pagesCount: Object.keys(pages).length,
      pageIds: Object.keys(pages),
      pageTypes: Object.values(pages).map(page => ({
        id: page._id,
        type: page._type,
        slug: page.slug,
        sectionsCount: page.sections?.length,
        sectionTypes: page.sections?.map((s: any) => s.type)
      })),
      preview
    });

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
      // Stille Fehlerbehandlung für nicht-blockierende Auth-Fehler
    }

    // Return data with auth state as optional
    return {
      user,
      session,
      preview,
      footerSettings,
      navigation,
      pages,
      themeSettings
    };
  } catch (error) {
    // Return minimal data to keep the app functioning
    return {
      user: null,
      session: null,
      preview: false,
      footerSettings: null,
      navigation: [],
      pages: {},
      themeSettings: null
    };
  }
};
