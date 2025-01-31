import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient } from '@supabase/supabase-js';
import { client } from '$lib/sanity/client';
import { footerSettingsQuery, type FooterSettings } from '$lib/sanity/queries/content';
import { navigationQuery, transformNavigationData } from '$lib/sanity/queries/navigation';
import { themeSettingsQuery, type ThemeSettings } from '$lib/sanity/queries/theme';
import { pagesQuery, transformPagesData } from '$lib/sanity/queries/pages';
import type { MenuItems } from '$lib/types/menu';
import type { UserBadge } from '$lib/utils/badge-utils';

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

    // Transform navigation data
    const navigation = transformNavigationData(rawNavigation);

    // Handle auth state and badges
    let authData: {
      user: any;
      session: any;
      userBadges: UserBadge[];
    } = {
      user: null,
      session: null,
      userBadges: []
    };

    try {
      if (locals.supabase) {
        // Get session first
        const { data: sessionData } = await locals.supabase.auth.getSession();
        authData.session = sessionData.session;

        // Only get user and badges if we have a session
        if (authData.session && locals.getUser) {
          authData.user = await locals.getUser();
          
          // Lade die Badges des Users
          const { data: badges } = await locals.supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', authData.user.id);
          
          if (badges) {
            authData.userBadges = badges;
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }

    // Transform pages data with user badges
    const pages = transformPagesData(rawPages, authData.userBadges);

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
      preview,
      userBadges: authData.userBadges
    });

    // Return data
    return {
      user: authData.user,
      session: authData.session,
      preview,
      footerSettings,
      navigation,
      pages,
      themeSettings
    };
  } catch (error) {
    console.error('Error in layout load:', error);
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
