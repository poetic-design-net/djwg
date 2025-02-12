import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { User } from '$lib/types/profile';
import type { OnlineTalk } from '$lib/types/onlineTalk';
import Logger from '$lib/services/logger';

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

interface SupabaseBadge {
  id: string;
  name: string;
  description?: string;
  style?: {
    borderStyle?: string;
    variant?: string;
  };
}

interface UserBadgeRow {
  badge_id: string;
  badge: SupabaseBadge;
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
        Logger.warn(`Retry attempt ${i + 1} for operation`, {
          ...context,
          error: error instanceof Error ? error.message : String(error),
          nextRetryDelay: delay
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

const fetchBadges = async (supabase: SupabaseClient, userId: string): Promise<Badge[]> => {
  const context = { 
    operation: 'fetchBadges', 
    userId,
    startTime: Date.now()
  };

  try {
    const { data, error } = await retryWithBackoff(
      async () => supabase
        .from('user_badges')
        .select('badge_id, badge:badges(id, name, description, style)')
        .eq('user_id', userId),
      context
    );

    if (error) {
      Logger.error('Error fetching badges', context, error);
      return [];
    }

    if (!data) {
      return [];
    }

    return (data as UserBadgeRow[]).map(row => ({
      _id: row.badge?.id || '',
      name: row.badge?.name || '',
      description: row.badge?.description || undefined,
      style: row.badge?.style ? {
        customColor: { hex: '#50C878' }, // Default Emerald Green
        borderStyle: row.badge.style.borderStyle,
        variant: row.badge.style.variant
      } : undefined
    }));
  } catch (error) {
    Logger.error('Error in fetchBadges', {
      ...context,
      duration: Date.now() - context.startTime
    }, error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

const fetchOnlineTalks = async (): Promise<OnlineTalk[]> => {
  const context = {
    operation: 'fetchOnlineTalks',
    startTime: Date.now()
  };

  try {
    return await retryWithBackoff(
      () => client.fetch<OnlineTalk[]>(onlineTalksQuery),
      context
    );
  } catch (error) {
    Logger.error('Error fetching online talks', {
      ...context,
      duration: Date.now() - context.startTime
    }, error instanceof Error ? error : new Error(String(error)));
    return [];
  }
};

export const load = async ({ locals, url }) => {
  const startTime = Date.now();
  const context = {
    path: url.pathname,
    operation: 'dashboardLoad'
  };

  try {
    // Session validieren
    const { data: { session }, error: sessionError } = await retryWithBackoff(
      () => locals.supabase.auth.getSession(),
      { ...context, operation: 'getSession' }
    );

    if (sessionError || !session) {
      Logger.warn('No valid session for dashboard', {
        ...context,
        error: sessionError?.message
      });
      throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
    }

    // User validieren
    const user = await locals.getUser();
    if (!user) {
      Logger.warn('No valid user for dashboard', context);
      throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
    }

    const isUserAdmin = isAdmin(user.email);

    // Parallel Requests mit individueller Fehlerbehandlung
    const [onlineTalks, badges] = await Promise.all([
      fetchOnlineTalks(),
      fetchBadges(locals.supabase, user.id)
    ]);

    // Log erfolgreichen Load
    Logger.info('Dashboard loaded successfully', {
      ...context,
      userId: user.id,
      isAdmin: isUserAdmin,
      duration: Date.now() - startTime
    });

    return {
      user,
      session,
      badges,
      onlineTalks,
      isAdmin: isUserAdmin
    };
  } catch (error) {
    // Wenn es kein Redirect ist, loggen wir den Fehler
    if (!(error instanceof Response && error.status === 303)) {
      Logger.error('Critical error in dashboard load', {
        ...context,
        duration: Date.now() - startTime
      }, error instanceof Error ? error : new Error(String(error)));
    }
    throw error;
  }
};
