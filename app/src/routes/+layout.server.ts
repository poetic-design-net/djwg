import type { LoaderLocals } from '@sanity/svelte-loader';
import type { SupabaseClient } from '@supabase/supabase-js';
import { client } from '$lib/sanity/client';
import { footerSettingsQuery, type FooterSettings, headerSettingsQuery, type HeaderSettings } from '$lib/sanity/queries/content';
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

    // Debug: Log all queries
    console.log('Executing headerSettings query:', headerSettingsQuery);

    // Test direct query
    // Test if headerSettings document exists
    const headerSettingsCount = await client.fetch('count(*[_type == "headerSettings"])');
    console.log('Number of headerSettings documents:', headerSettingsCount);

    if (headerSettingsCount === 0) {
      console.warn('No headerSettings document found in Sanity. Please create one in the Studio.');
    }

    // Test direct query with more detailed error handling
    try {
      const testHeaderSettings = await client.fetch(`*[_type == "headerSettings"][0] {
        _type,
        _id,
        logo {
          _type,
          asset-> {
            _id,
            url,
            _type
          }
        }
      }`);
      
      console.log('Test headerSettings query result:', JSON.stringify(testHeaderSettings, null, 2));
    } catch (error) {
      console.error('Error fetching headerSettings:', error);
    }
    // Fetch footer settings, navigation, theme settings, and pages in parallel
    const [footerSettings, headerSettings, rawNavigation, themeSettings, rawPages] = await Promise.all([
      client.fetch<FooterSettings>(footerSettingsQuery),
      client.fetch<HeaderSettings>(headerSettingsQuery),
      client.fetch(navigationQuery),
      client.fetch<ThemeSettings>(themeSettingsQuery),
      client.fetch(pagesQuery)
    ]);

    console.log('Raw headerSettings from Sanity:', JSON.stringify(headerSettings, null, 2));
    console.log('Sanity Client Config:', {
      projectId: client.config().projectId,
      dataset: client.config().dataset,
      apiVersion: client.config().apiVersion
    });

    // Transform navigation data
    const navigation = transformNavigationData(rawNavigation);

    // Handle auth state and badges
    let authData: {
      user: any;
      session: any;
      userBadges: UserBadge[];
      profile: any;
    } = {
      user: null,
      session: null,
      userBadges: [],
      profile: null
    };

    try {
      if (locals.supabase) {
        // Get session first
        const { data: sessionData } = await locals.supabase.auth.getSession();
        authData.session = sessionData.session;

        // Only get user and badges if we have a session
        if (authData.session && locals.getUser) {
          authData.user = await locals.getUser();

          // Lade das Profil des Users
          const { data: profile } = await locals.supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();
          
          // Lade die Badges des Users
          const { data: badges } = await locals.supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', authData.user.id);
          
          // Debug: Log profile data
          console.log('Loaded profile data:', JSON.stringify(profile, null, 2));
          
          if (profile) {
            authData.profile = profile;
            
            // Wenn es ein Google-Auth ist, behalte die benutzerdefinierten Namen
            if (authData.user.user_metadata?.provider === 'google' && profile.full_name) {
              const [firstName = '', lastName = ''] = profile.full_name.split(' ');
              
              // Aktualisiere die Metadaten mit den benutzerdefinierten Namen
              const { error: updateError } = await locals.supabase.auth.updateUser({
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  name: profile.full_name,
                  full_name: profile.full_name
                }
              });
              
              if (!updateError) {
                authData.user.user_metadata = {
                  ...authData.user.user_metadata,
                  first_name: firstName,
                  last_name: lastName,
                  name: profile.full_name,
                  full_name: profile.full_name
                };
              }
            }
          }

          if (badges) {
            authData.userBadges = badges;
            // Füge die Badges auch zur User-Session hinzu
            authData.user.badges = badges;
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }

    // Transform pages data with user badges
    const pages = transformPagesData(rawPages, authData.userBadges);

    // Debug-Ausgaben
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
      userBadges: authData.userBadges,
      headerSettings // Debug headerSettings
    });
    // Prepare headerSettings with fallback
    const finalHeaderSettings = headerSettings || {
      _type: 'headerSettings',
      _id: 'default',
      logo: null
    };

    // Return data with fallback
    return {
      user: authData.user,
      session: authData.session,
      profile: authData.profile,
      preview,
      footerSettings,
      headerSettings: finalHeaderSettings,
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
      profile: null,
      preview: false,
      footerSettings: null,
      headerSettings: null,
      navigation: [],
      pages: {},
      themeSettings: null
    };
  }
};
