import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { EnrichedProfile } from '$lib/types/profile';

const CLUB_MANAGER_PASSWORD = "cm_djwg_2025"; // In der Praxis sollte dies in einer .env Datei sein
const DJ_URLAUB_BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  const isAuthenticated = cookies.get('club_manager_auth') === CLUB_MANAGER_PASSWORD;

  if (!isAuthenticated) {
    return {
      isAuthenticated: false,
      error: null as string | null,
      djs: [] as EnrichedProfile[]
    };
  }

  try {
    // 1. Hole alle User-Badge-Zuweisungen für das DJ Badge
    const { data: userBadges, error: badgesError } = await locals.supabase
      .from('user_badges')
      .select('user_id')
      .eq('badge_id', DJ_URLAUB_BADGE_ID);

    if (badgesError) {
      console.error('Badge query error:', badgesError);
      return {
        isAuthenticated: true,
        djs: [],
        error: 'Fehler beim Laden der Badge-Zuweisungen'
      };
    }

    if (!userBadges?.length) {
      console.log('No users found with DJ badge');
      return {
        isAuthenticated: true,
        djs: [],
        error: null
      };
    }

    const djUserIds = userBadges.map(ub => ub.user_id);

    // 2. Hole die Profile für diese User-IDs (erst mal nur Basisfelder)
    const { data: profiles, error: profileError } = await locals.supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        avatar_url,
        website,
        phone,
        social_links,
        travel_group_size,
        travel_group_ages,
        visited_clubs,
        biography,
        video_mix_url
      `)
      .in('id', djUserIds);

    if (profileError) {
      console.error('Profile query error:', profileError);
      return {
        isAuthenticated: true,
        djs: [],
        error: 'Fehler beim Laden der DJ-Profile'
      };
    }

    // Bereite die DJ-Liste vor mit Standardwerten für fehlende Felder
    const enrichedDjs = (profiles || []).map(profile => ({
      ...profile,
      // Füge das Badge hinzu
      badges: [{ badge_id: DJ_URLAUB_BADGE_ID }],
      // Stelle sicher, dass optionale Felder einen Standardwert haben
      username: profile.username || '',
      full_name: profile.full_name || '',
      email: profile.email || '',
      avatar_url: profile.avatar_url || '',
      website: profile.website || '',
      phone: profile.phone || '',
      social_links: profile.social_links || {},
      travel_group_size: profile.travel_group_size || 1,
      travel_group_ages: profile.travel_group_ages || '',
      visited_clubs: Array.isArray(profile.visited_clubs) ? profile.visited_clubs : [],
      biography: profile.biography || '',
      video_mix_url: profile.video_mix_url || ''
    })) as EnrichedProfile[];

    return {
      isAuthenticated: true,
      djs: enrichedDjs,
      error: null
    };

  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      isAuthenticated: true,
      djs: [],
      error: 'Ein unerwarteter Fehler ist aufgetreten'
    };
  }
};

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const password = data.get('password');

    if (password === CLUB_MANAGER_PASSWORD) {
      cookies.set('club_manager_auth', CLUB_MANAGER_PASSWORD, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 // 24 Stunden
      });
      
      return {
        success: true
      };
    }

    return {
      success: false,
      error: 'Falsches Passwort. Bitte versuche es erneut.'
    };
  }
};