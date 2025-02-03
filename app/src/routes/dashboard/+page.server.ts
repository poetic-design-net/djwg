import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { User } from '$lib/types/profile';
import type { OnlineTalk } from '$lib/types/onlineTalk';

interface Badge {
  _id: string;
  name: string;
  description?: string;
  style?: {
    customColor: {
      hex: string;
    };
    borderStyle?: string;
    variant?: string;
  };
}

const fetchBadges = async (supabase: SupabaseClient, userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id, badge:badges(id, name, description, style)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(row => ({
      _id: row.badge?.id || '',
      name: row.badge?.name || '',
      description: row.badge?.description || undefined,
      style: row.badge?.style ? {
        customColor: { hex: '#50C878' },
        borderStyle: row.badge.style.borderStyle,
        variant: row.badge.style.variant
      } : undefined
    }));
  } catch (error) {
    console.error('Error in fetchBadges:', error);
    return [];
  }
};

export const load = async ({ locals }) => {
  const session = await locals.supabase.auth.getSession();
  const user = await locals.getUser();
  
  if (!session.data.session || !user) {
    throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
  }

  const isUserAdmin = isAdmin(user.email);

  // Parallel Requests für bessere Performance
  const [onlineTalks, badges] = await Promise.all([
    // Online Talks aus Sanity laden
    client.fetch<OnlineTalk[]>(onlineTalksQuery),
    // Badges aus Supabase laden
    fetchBadges(locals.supabase, user.id)
  ]);

  return {
    user,
    session: session.data.session,
    badges,
    onlineTalks,
    isAdmin: isUserAdmin
  };
};
