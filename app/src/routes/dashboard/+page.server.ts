import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { User } from '$lib/types/profile';
import type { OnlineTalk } from '$lib/types/onlineTalk';
import type { LoaderLocals } from '@sanity/svelte-loader';

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
    badge: {
        id: string;
        name: string;
        description?: string;
        style?: {
            borderStyle?: string;
            variant?: string;
        };
    };
}

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<User | null>;
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

const fetchBadges = async (
    supabase: SupabaseClient, 
    userId: string, 
    context: Record<string, unknown>
): Promise<Badge[]> => {
    try {
        const { data, error } = await retryWithBackoff(
            async () => supabase
                .from('user_badges')
                .select('badge_id, badge:badges(id, name, description, style)')
                .eq('user_id', userId),
            context
        );

        if (error || !data) {
            console.error('Error fetching badges:', error);
            return [];
        }

        const typedData = data as unknown as UserBadgeRow[];
        
        return typedData.map(row => ({
            _id: row.badge.id || '',
            name: row.badge.name || '',
            description: row.badge.description,
            style: row.badge.style ? {
                customColor: { hex: '#50C878' }, // Default Emerald Green
                borderStyle: row.badge.style.borderStyle,
                variant: row.badge.style.variant
            } : undefined
        })).filter(badge => badge._id !== '');
    } catch (error) {
        console.error('Unexpected error in fetchBadges:', error);
        return [];
    }
};

const fetchOnlineTalks = async (context: Record<string, unknown>): Promise<OnlineTalk[]> => {
    try {
        return await retryWithBackoff(
            () => client.fetch<OnlineTalk[]>(onlineTalksQuery),
            context
        );
    } catch (error) {
        console.error('Error fetching online talks:', error);
        return [];
    }
};

export const load: PageServerLoad = async ({ locals, url }) => {
    const typedLocals = locals as unknown as AppLocals;
    const context = {
        path: url.pathname,
        operation: 'dashboardLoad',
        startTime: Date.now()
    };

    try {
        // Session validation
        const { data: { session }, error: sessionError } = await retryWithBackoff(
            () => typedLocals.supabase.auth.getSession(),
            { ...context, operation: 'getSession' }
        );

        if (sessionError || !session) {
            throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
        }

        // User validation
        const user = await typedLocals.getUser();
        if (!user) {
            throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
        }

        const isUserAdmin = isAdmin(user.email);

        // Parallel requests with individual error handling
        const [onlineTalks, badges] = await Promise.all([
            fetchOnlineTalks(context),
            fetchBadges(typedLocals.supabase, user.id, context)
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
        console.error('Unexpected error in load function:', error);
        throw error;
    }
}