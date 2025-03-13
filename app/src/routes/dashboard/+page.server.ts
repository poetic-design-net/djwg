import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import type { User, Profile } from '$lib/types/profile';
import type { LoaderLocals } from '@sanity/svelte-loader';
import { manageBadgesRealtime } from '$lib/services/badge-service';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<User | null>;
}

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

        // Badge-Management für den Benutzer
        await manageBadgesRealtime(typedLocals.supabase, user.id, profile);

        // Fetch online talks
        const onlineTalks = await client.fetch(onlineTalksQuery);

        return {
            user,
            session,
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