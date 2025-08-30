import { writable, derived } from 'svelte/store';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

interface JuryRating {
	submission_id: string;
	juror_id: string;
	rating: number;
	comments?: string;
	category: string;
	updated_at: string;
}

interface JuryStats {
	submission_id: string;
	average_rating: number;
	total_ratings: number;
}

// Store for real-time ratings
const ratingsStore = writable<Map<string, JuryRating>>(new Map());

// Store for real-time statistics
const statsStore = writable<Map<string, JuryStats>>(new Map());

// Active channel reference
let channel: RealtimeChannel | null = null;

// Subscribe to real-time updates (needs supabase client passed in)
export function subscribeToJuryUpdates(userId: string, supabaseClient: SupabaseClient) {
	// Clean up existing subscription
	if (channel) {
		supabaseClient.removeChannel(channel);
	}
	
	// Create new channel for jury updates
	channel = supabaseClient
		.channel('jury-updates')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'jury_ratings'
			},
			(payload) => {
				console.log('Rating update received:', payload);
				
				// Update ratings store
				if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
					const rating = payload.new as JuryRating;
					ratingsStore.update(ratings => {
						ratings.set(rating.submission_id, rating);
						return ratings;
					});
					
					// Note: Need to pass supabase client to update stats
					// updateSubmissionStats(rating.submission_id, supabaseClient);
				} else if (payload.eventType === 'DELETE') {
					const rating = payload.old as JuryRating;
					ratingsStore.update(ratings => {
						if (ratings.get(rating.submission_id)?.juror_id === rating.juror_id) {
							ratings.delete(rating.submission_id);
						}
						return ratings;
					});
				}
			}
		)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'submission_stats',
				filter: `juror_id=eq.${userId}`
			},
			(payload) => {
				console.log('Stats update received:', payload);
				
				// Update stats store
				if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
					const stats = payload.new as JuryStats;
					statsStore.update(allStats => {
						allStats.set(stats.submission_id, stats);
						return allStats;
					});
				}
			}
		)
		.subscribe((status) => {
			console.log('Subscription status:', status);
		});
}

// Unsubscribe from real-time updates
export function unsubscribeFromJuryUpdates(supabaseClient: SupabaseClient) {
	if (channel) {
		supabaseClient.removeChannel(channel);
		channel = null;
	}
}

// Fetch updated statistics for a submission (needs supabase client)
async function updateSubmissionStats(submissionId: string, supabaseClient: SupabaseClient) {
	try {
		const { data, error } = await supabaseClient
			.from('submission_stats')
			.select('*')
			.eq('submission_id', submissionId)
			.single();
		
		if (data && !error) {
			statsStore.update(stats => {
				stats.set(submissionId, data);
				return stats;
			});
		}
	} catch (error) {
		console.error('Failed to fetch submission stats:', error);
	}
}

// Derived store for getting rating by submission ID
export const getSubmissionRating = (submissionId: string) => {
	return derived(ratingsStore, $ratings => $ratings.get(submissionId));
};

// Derived store for getting stats by submission ID
export const getSubmissionStats = (submissionId: string) => {
	return derived(statsStore, $stats => $stats.get(submissionId));
};

// Export stores
export { ratingsStore, statsStore };