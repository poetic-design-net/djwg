import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { User, Profile } from '$lib/types/profile';
import type { OnlineTalk } from '$lib/types/onlineTalk';
import type { LoaderLocals } from '@sanity/svelte-loader';
import { debugBadgeAssignment } from '$lib/services/badge-service';

interface SanityBadge {
    _id: string;
    supabaseId: string;
    name: string;
    description?: string;
    slug: {
        current: string;
    };
    icon?: {
        asset: {
            url: string;
        };
    };
    style?: {
        customColor?: string;
        borderStyle?: 'solid' | 'dashed' | 'double';
        variant?: 'gold' | 'silver' | 'bronze' | 'custom';
    };
    permissions?: Array<{
        resource: string;
        action: string;
    }>;
}

interface DashboardBadge extends Omit<SanityBadge, 'slug'> {
    slug: string;
    isUnlocked: boolean;
    unlockCondition?: string;
    unlockReward?: string;
}

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<User | null>;
}

const BADGE_CONDITIONS = {
    'dj-level-1': {
        condition: 'Vervollständige dein Profil zu 100%',
        reward: 'Freischaltung der DJ-Features Level 1'
    }
};

const badgesQuery = `*[_type == "badge"] {
    _id,
    supabaseId,
    name,
    description,
    "slug": slug.current,
    "icon": icon.asset->{
        url
    },
    style {
        customColor,
        borderStyle,
        variant
    },
    permissions[] {
        resource,
        action
    }
}`;

const fetchSanityBadges = async (): Promise<SanityBadge[]> => {
    try {
        return await client.fetch(badgesQuery);
    } catch (error) {
        console.error('Error fetching Sanity badges:', error);
        return [];
    }
};

const fetchUnlockedBadgeIds = async (
    supabase: SupabaseClient, 
    userId: string
): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching unlocked badges:', error);
            return [];
        }

        return (data || []).map(row => row.badge_id);
    } catch (error) {
        console.error('Unexpected error in fetchUnlockedBadgeIds:', error);
        return [];
    }
};

const createBadgeList = (
    sanityBadges: SanityBadge[],
    unlockedBadgeIds: string[],
): DashboardBadge[] => {
    return sanityBadges.map(badge => {
        const conditions = BADGE_CONDITIONS[badge.slug.current as keyof typeof BADGE_CONDITIONS] || {
            condition: 'Bedingungen noch nicht definiert',
            reward: 'Belohnung noch nicht definiert'
        };

        const isUnlocked = unlockedBadgeIds.includes(badge.supabaseId);

        return {
            ...badge,
            slug: badge.slug.current,
            isUnlocked,
            unlockCondition: conditions.condition,
            unlockReward: conditions.reward
        };
    });
};

export const load: PageServerLoad = async ({ locals }) => {
    const typedLocals = locals as unknown as AppLocals;

    try {
        // Session validation
        const { data: { session }, error: sessionError } = await typedLocals.supabase.auth.getSession();

        if (sessionError || !session) {
            throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
        }

        // User validation
        const user = await typedLocals.getUser();
        if (!user) {
            throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
        }

        const isUserAdmin = isAdmin(user.email);

        // Fetch profile
        const { data: profile } = await typedLocals.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Debug Badge-Zuweisung
        await debugBadgeAssignment(typedLocals.supabase, user.id, profile);

        // Fetch remaining data
        const [sanityBadges, unlockedBadgeIds, onlineTalks] = await Promise.all([
            fetchSanityBadges(),
            fetchUnlockedBadgeIds(typedLocals.supabase, user.id),
            client.fetch(onlineTalksQuery)
        ]);

        const badges = createBadgeList(sanityBadges, unlockedBadgeIds);

        return {
            user,
            session,
            badges,
            onlineTalks,
            isAdmin: isUserAdmin,
            profile
        };
    } catch (error) {
        if (error instanceof Response && error.status === 303) {
            throw error;
        }
        console.error('Unexpected error in load function:', error);
        throw error;
    }
};