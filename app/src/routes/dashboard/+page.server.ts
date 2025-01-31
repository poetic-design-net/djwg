import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { SupabaseClient } from '@supabase/supabase-js';

interface DatabaseBadge {
  id: string;
  name: string;
  description: string | null;
  style: {
    variant?: string;
    borderStyle?: string;
  } | null;
}

interface UserBadgeRow {
  badge_id: string;
  badge: DatabaseBadge;
}

interface Badge {
  _id: string;
  name: string;
  description?: string;
  style?: {
    customColor?: {
      hex: string;
    };
    borderStyle?: string;
    variant?: string;
  };
}

interface OnlineTalk {
  _id: string;
  title: string;
  date: string;
  link: string;
  password: string;
  visibleFromHours: number;
}

interface User {
  id: string;
  // Weitere User-Properties hier hinzufügen
}

const fetchBadges = async (supabase: SupabaseClient, userId: string): Promise<Badge[]> => {
  try {
    const { data: userBadges, error } = await supabase
      .from('user_badges')
      .select('badge_id, badge:badges!inner(*)')
      .eq('user_id', userId)
      .single<UserBadgeRow>();

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    if (!userBadges?.badge) {
      return [];
    }

    const badge: Badge = {
      _id: userBadges.badge.id,
      name: userBadges.badge.name,
      description: userBadges.badge.description || undefined,
      style: userBadges.badge.style ? {
        customColor: { hex: '#50C878' }, // Standard Premium-Grün
        borderStyle: userBadges.badge.style.borderStyle,
        variant: userBadges.badge.style.variant
      } : undefined
    };

    return [badge];
  } catch (error) {
    console.error('Error in fetchBadges:', error);
    return [];
  }
};

interface Locals {
  supabase: SupabaseClient;
  getUser: () => Promise<User | null>;
}

export const load: PageServerLoad = async ({ locals, setHeaders }: { locals: Locals; setHeaders: (headers: Record<string, string>) => void }) => {
  setHeaders({
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'pragma': 'no-cache',
    'expires': '0'
  });

  const session = locals.supabase ? (await locals.supabase.auth.getSession()).data.session : null;
  const user = await locals.getUser();
  
  if (!session || !user) {
    throw redirect(303, '/auth');
  }

  // Parallel Requests für bessere Performance
  const [onlineTalks, badges] = await Promise.all([
    // Online Talks aus Sanity laden
    client.fetch<OnlineTalk[]>(onlineTalksQuery),
    // Badges aus Supabase laden
    fetchBadges(locals.supabase, user.id)
  ]);

  return {
    user,
    session,
    badges,
    onlineTalks
  };
};
