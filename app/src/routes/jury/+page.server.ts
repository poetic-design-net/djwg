import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoaderLocals } from '@sanity/svelte-loader';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<any>;
}

export const load: PageServerLoad = async ({ locals }) => {
	const typedLocals = locals as unknown as AppLocals;
	
	// Check authentication
	const user = await typedLocals.getUser();
	if (!user) {
		throw redirect(303, '/auth?next=/jury');
	}

	// Check if user is admin
	const { data: profile } = await typedLocals.supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();
	
	const isAdmin = profile?.role === 'admin';

	// Fetch user's badges (admins get access automatically)
	const { data: userBadges } = await typedLocals.supabase
		.from('user_badges')
		.select('badge_id')
		.eq('user_id', user.id);

	// If admin, add the award badge to their badges for frontend display
	const badgesWithAdminAccess = isAdmin 
		? [...(userBadges || []), { badge_id: 'fc005104-5c29-44bc-b05f-1f5e5ef817a1' }]
		: userBadges || [];

	return {
		user,
		userBadges: badgesWithAdminAccess,
		isAdmin
	};
};