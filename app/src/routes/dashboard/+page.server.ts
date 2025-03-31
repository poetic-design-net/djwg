import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import { videosQuery, type Video } from '$lib/sanity/queries/videos';
import type { User, Profile } from '$lib/types/profile';
import type { LoaderLocals } from '@sanity/svelte-loader';
import { manageBadgesRealtime } from '$lib/services/badge-service';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<User | null>;
}

export const load: PageServerLoad = async ({ locals, depends }) => {
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

        // Abhängigkeit für Profil-Updates deklarieren
        depends('app:profile');

        // Fetch profile
        const { data: profile } = await typedLocals.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Badge-Management für den Benutzer
        await manageBadgesRealtime(typedLocals.supabase, user.id, profile);

        // Fetch online talks
        const onlineTalks = await client.fetch(onlineTalksQuery);

        // Fetch videos from Sanity with initial data
        const rawVideos = await typedLocals.loadQuery<Video[]>(videosQuery);

        // Get user badges
        const { data: badges } = await typedLocals.supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id);
        
        const userBadges = badges || [];

        return {
            user: {
                ...user,
                badges: userBadges
            },
            session,
            onlineTalks,
            isAdmin: isUserAdmin,
            profile,
            videos: {
                query: videosQuery,
                data: rawVideos,
                options: { initial: rawVideos }
            }
        };
    } catch (error) {
        if (error instanceof Response && error.status === 303) {
            throw error;
        }
        console.error('Unexpected error in load function:', error);
        throw error;
    }
};
