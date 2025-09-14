import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/config/admin.server';
import { client } from '$lib/sanity/client';
import { onlineTalksQuery } from '$lib/sanity/queries/onlineTalks';
import { getAward } from '$lib/sanity/queries/award';
import { videosQuery, type Video } from '$lib/sanity/queries/videos';
import type { User, Profile } from '$lib/types/profile';
import type { LoaderLocals } from '@sanity/svelte-loader';
import { manageBadgesRealtime } from '$lib/services/badge-service';

interface AppLocals extends LoaderLocals {
	supabase: SupabaseClient;
	getUser(): Promise<User | null>;
}

export const load: PageServerLoad = async ({ locals, depends, setHeaders }) => {
	const typedLocals = locals as unknown as AppLocals;

	// Set cache headers for static content
	setHeaders({
		'cache-control': 'private, max-age=0, must-revalidate'
	});

	try {
		// Quick auth check - redirect immediately if not authenticated
		const { data: { session }, error: sessionError } = await typedLocals.supabase.auth.getSession();

		if (sessionError || !session) {
			throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
		}

		// Get user - critical for auth
		const user = await typedLocals.getUser();
		if (!user) {
			throw redirect(303, `/auth?next=${encodeURIComponent('/dashboard')}`);
		}

		const isUserAdmin = isAdmin(user.email);

		// Declare dependency for profile updates
		depends('app:profile');

		// Start all data fetching in parallel for performance
		const [
			profileResult,
			onlineTalksResult,
			awardResult,
			videosResult,
			badgesResult
		] = await Promise.allSettled([
			// Fetch profile
			typedLocals.supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single(),

			// Fetch online talks
			client.fetch(onlineTalksQuery),

			// Fetch award data
			getAward(),

			// Fetch videos from Sanity
			typedLocals.loadQuery<Video[]>(videosQuery),

			// Get user badges
			typedLocals.supabase
				.from('user_badges')
				.select('badge_id')
				.eq('user_id', user.id)
		]);

		// Process results with fallbacks
		const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
		const onlineTalks = onlineTalksResult.status === 'fulfilled' ? onlineTalksResult.value : [];
		const award = awardResult.status === 'fulfilled' ? awardResult.value : { data: null };
		const rawVideos = videosResult.status === 'fulfilled' ? videosResult.value : null;
		const badges = badgesResult.status === 'fulfilled' ? badgesResult.value.data : [];

		// Badge management in background (non-blocking)
		if (profile) {
			manageBadgesRealtime(typedLocals.supabase, user.id, profile).catch(err => {
				console.error('Badge management error:', err);
			});
		}

		return {
			user: {
				...user,
				badges: badges || []
			},
			session,
			onlineTalks,
			award: award.data,
			isAdmin: isUserAdmin,
			profile,
			videos: rawVideos ? {
				query: videosQuery,
				data: rawVideos,
				options: { initial: rawVideos }
			} : {}
		};
	} catch (error) {
		if (error instanceof Response && error.status === 303) {
			throw error;
		}
		console.error('Unexpected error in dashboard load:', error);

		// Graceful fallback for non-critical errors
		throw redirect(303, '/auth');
	}
};