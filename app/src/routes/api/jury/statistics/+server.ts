import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoaderLocals } from '@sanity/svelte-loader';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<any>;
}

const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';

// GET: Fetch jury statistics and analytics
export const GET: RequestHandler = async ({ locals, url }) => {
	const typedLocals = locals as unknown as AppLocals;
	
	// Check authentication
	const user = await typedLocals.getUser();
	if (!user) {
		throw error(401, 'Authentication required');
	}

	// Check if user is admin
	const { data: profile } = await typedLocals.supabase
		.from('profiles')
		.select('role')
		.eq('id', user.id)
		.single();
	
	const isAdmin = profile?.role === 'admin';

	// Verify award badge access OR admin role
	if (!isAdmin) {
		const { data: badgeData } = await typedLocals.supabase
			.from('user_badges')
			.select('badge_id')
			.eq('user_id', user.id)
			.eq('badge_id', AWARD_BADGE_ID)
			.single();

		if (!badgeData) {
			throw error(403, 'Award badge or admin role required for jury access');
		}
	}

	const category = url.searchParams.get('category');

	try {
		// Get overall statistics
		const { data: overallStats } = await typedLocals.supabase
			.rpc('get_jury_statistics', { p_juror_id: user.id });

		// Get category breakdown
		const categoryQuery = typedLocals.supabase
			.from('jury_ratings')
			.select('category, rating')
			.eq('juror_id', user.id);

		if (category) {
			categoryQuery.eq('category', category);
		}

		const { data: categoryData } = await categoryQuery;

		// Calculate category statistics
		const categoryStats = categoryData?.reduce((acc, curr) => {
			if (!acc[curr.category]) {
				acc[curr.category] = {
					count: 0,
					total: 0,
					ratings: []
				};
			}
			acc[curr.category].count++;
			acc[curr.category].total += curr.rating;
			acc[curr.category].ratings.push(curr.rating);
			return acc;
		}, {} as Record<string, any>) || {};

		// Calculate averages and distribution
		Object.keys(categoryStats).forEach(cat => {
			const stats = categoryStats[cat];
			stats.average = (stats.total / stats.count).toFixed(2);
			stats.distribution = calculateDistribution(stats.ratings);
			delete stats.total;
			delete stats.ratings;
		});

		// Get recent activity
		const { data: recentActivity } = await typedLocals.supabase
			.from('jury_ratings')
			.select('submission_id, rating, category, updated_at')
			.eq('juror_id', user.id)
			.order('updated_at', { ascending: false })
			.limit(10);

		// Get leaderboard (top rated submissions)
		const { data: leaderboard } = await typedLocals.supabase
			.from('submission_stats')
			.select('*')
			.order('average_rating', { ascending: false })
			.limit(10);

		// Fetch submission details from Sanity for leaderboard
		let enrichedLeaderboard = leaderboard;
		if (leaderboard && leaderboard.length > 0) {
			const submissionIds = leaderboard.map(item => item.submission_id);
			const { client } = await import('$lib/sanity/client');
			const submissions = await client.fetch(`
				*[_type == "awardUpload" && _id in $ids] {
					_id,
					userName,
					userEmail
				}
			`, { ids: submissionIds });

			const submissionMap = new Map<string, any>(submissions.map((s: any) => [s._id, s]));
			enrichedLeaderboard = leaderboard.map(item => ({
				...item,
				userName: submissionMap.get(item.submission_id)?.userName || 'Unknown',
				userEmail: submissionMap.get(item.submission_id)?.userEmail || ''
			}));
		}

		// Get all jurors progress (for admins only)
		let allJurorsProgress = null;
		const { data: profileData } = await typedLocals.supabase
			.from('profiles')
			.select('is_admin')
			.eq('id', user.id)
			.single();

		if (profileData?.is_admin) {
			const { data } = await typedLocals.supabase
				.from('jury_progress')
				.select(`
					*,
					profiles!juror_id (
						username,
						avatar_url
					)
				`)
				.order('rated_count', { ascending: false });
			allJurorsProgress = data;
		}

		return json({
			overall: overallStats?.[0] || null,
			categories: categoryStats,
			recentActivity,
			leaderboard: enrichedLeaderboard,
			allJurorsProgress,
			timestamp: new Date().toISOString()
		});

	} catch (err) {
		console.error('Failed to fetch statistics:', err);
		throw error(500, 'Failed to fetch statistics');
	}
};

// Helper function to calculate rating distribution
function calculateDistribution(ratings: number[]): Record<number, number> {
	const distribution: Record<number, number> = {};
	for (let i = 1; i <= 10; i++) {
		distribution[i] = 0;
	}
	ratings.forEach(rating => {
		distribution[rating]++;
	});
	return distribution;
}