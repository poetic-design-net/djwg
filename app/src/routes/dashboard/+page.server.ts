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

interface SupabaseBadgeRow {
  badge_id: string;
  badge: {
    id: string;
    name: string;
    description?: string;
    style?: {
      borderStyle?: string;
      variant?: string;
    };
  }[];
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: Record<string, unknown>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

const fetchBadges = async (supabase: SupabaseClient, userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await retryWithBackoff(
      async () => supabase
        .from('user_badges')
        .select('badge_id, badge:badges(id, name, description, style)')
        .eq('user_id', userId),
      { operation: 'fetchBadges', userId }
    );

    if (error || !data) {
      return [];
    }

    return (data as SupabaseBadgeRow[]).map(row => {
      const badge = row.badge[0]; // Nehmen wir das erste Badge aus dem Array
      if (!badge) return {
        _id: '',
        name: '',
      };

      return {
        _id: badge.id,
        name: badge.name,
        description: badge.description,
        style: badge.style ? {
          customColor: { hex: '#50C878' }, // Default Emerald Green
          borderStyle: badge.style.borderStyle,
          variant: badge.style.variant
        } : undefined
      };
    });
  } catch {
    return [];
  }
};

const fetchOnlineTalks = async (): Promise<OnlineTalk[]> => {
  try {
    return await retryWithBackoff(
      () => client.fetch<OnlineTalk[]>(onlineTalksQuery),
      { operation: 'fetchOnlineTalks' }
    );
  } catch {
    return [];
  }
};

export const load = async ({ locals, url }) => {
  try {
    // Session validieren
    const { data: { session }, error: sessionError } = await retryWithBackoff(
      () => locals.supabase.auth.getSession(),
      { operation: 'getSession', path: url.pathname }
    );

    if (sessionError || !session) {
      throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
    }

    // User validieren
    const user = await locals.getUser();
    if (!user) {
      throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
    }

    const isUserAdmin = isAdmin(user.email);

    // Parallel Requests mit individueller Fehlerbehandlung
    const [onlineTalks, badges] = await Promise.all([
      fetchOnlineTalks(),
      fetchBadges(locals.supabase, user.id)
    ]);

    return {
      user,
      session,
      badges,
      onlineTalks,
      isAdmin: isUserAdmin
    };
  } catch (error) {
    if (error instanceof Response && error.status === 303) {
      throw error;
    }
    throw error;
  }
};
