import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { client } from '$lib/sanity/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoaderLocals } from '@sanity/svelte-loader';
import { dataset, projectId } from '$lib/sanity/api';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<any>;
}

const AWARD_BADGE_ID = 'fc005104-5c29-44bc-b05f-1f5e5ef817a1';

// Helper function to construct file URL from Sanity file reference
function getFileUrl(file: any): string | null {
	if (!file?.asset?._ref) return null;
	
	// Extract file ID from reference: file-{id}-{extension}
	const refParts = file.asset._ref.split('-');
	if (refParts.length < 3) return null;
	
	const fileId = refParts[1];
	const extension = refParts[refParts.length - 1];
	
	// Construct CDN URL
	return `https://cdn.sanity.io/files/${projectId}/${dataset}/${fileId}.${extension}`;
}

// GET: Fetch all submissions with user's ratings
export const GET: RequestHandler = async ({ locals }) => {
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
		
		const hasAccess = !!badgeData;
		if (!hasAccess) {
			throw error(403, 'Award badge or admin role required for jury access');
		}
	}

	try {
		// Fetch all award submissions from Sanity
		const submissions = await client.fetch(`
			*[_type == "awardUpload" && status != "rejected"] | order(uploadedAt desc) {
				_id,
				userId,
				userName,
				userEmail,
				status,
				"fileUrl": asset.file.asset->url,
				"imageUrl": asset.image.asset->url,
				asset,
				description,
				uploadedAt,
				_createdAt,
				winner,
				isWinner,
				originalFilename,
				fileType,
				fileSize
			}
		`);
		
		// Process and group submissions by user
		const userSubmissionsMap = new Map<string, any>();
		
		submissions.forEach((submission: any) => {
			const userId = submission.userId || submission.userEmail; // Use userId or email as key
			
			// Process file URLs
			const fileUrl = submission.fileUrl || getFileUrl(submission.asset?.file);
			const imageUrl = submission.imageUrl || (submission.asset?.image ? 
				`https://cdn.sanity.io/images/${projectId}/${dataset}/${submission.asset.image.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png')}` : null);
			
			const processedFile = {
				...submission,
				fileUrl: fileUrl || imageUrl, // Use fileUrl or imageUrl as fallback
				imageUrl,
				fileName: submission.originalFilename,
				fileType: submission.fileType
			};
			
			if (!userSubmissionsMap.has(userId)) {
				// First submission for this user - create a grouped entry
				userSubmissionsMap.set(userId, {
					_id: submission._id, // Use first submission's ID as main ID
					userId: submission.userId,
					userName: submission.userName,
					userEmail: submission.userEmail,
					status: submission.status,
					uploadedAt: submission.uploadedAt,
					_createdAt: submission._createdAt,
					winner: submission.winner || submission.isWinner,
					files: [processedFile] // Start files array with this submission
				});
			} else {
				// Additional submission for this user - add to files array
				const userEntry = userSubmissionsMap.get(userId);
				userEntry.files.push(processedFile);
				// Update status to the most recent submission's status
				if (new Date(submission.uploadedAt) > new Date(userEntry.uploadedAt)) {
					userEntry.status = submission.status;
					userEntry.uploadedAt = submission.uploadedAt;
				}
			}
		});
		
		// Convert map to array
		const processedSubmissions = Array.from(userSubmissionsMap.values());

		// Fetch user's existing ratings from Supabase
		const { data: userRatings } = await typedLocals.supabase
			.from('jury_ratings')
			.select('submission_id, rating, comments, updated_at')
			.eq('juror_id', user.id);

		// Create a map of user ratings for quick lookup
		const ratingsMap = new Map(
			userRatings?.map(r => [r.submission_id, r]) || []
		);

		// Fetch submission statistics
		const { data: stats } = await typedLocals.supabase
			.from('submission_stats')
			.select('*');

		const statsMap = new Map(
			stats?.map(s => [s.submission_id, s]) || []
		);

		// Combine submissions with ratings and stats
		const enrichedSubmissions = processedSubmissions.map((submission: any) => ({
			...submission,
			userRating: ratingsMap.get(submission._id) || null,
			stats: statsMap.get(submission._id) || {
				total_ratings: 0,
				average_rating: null,
				min_rating: null,
				max_rating: null,
				rating_deviation: null
			}
		}));

		// Get jury progress for current user
		const { data: progress } = await typedLocals.supabase
			.from('jury_progress')
			.select('*')
			.eq('juror_id', user.id)
			.single();

		return json({
			submissions: enrichedSubmissions,
			progress: progress || {
				rated_count: 0,
				categories_rated: 0,
				average_rating: null,
				min_rating: null,
				max_rating: null,
				last_activity: null
			},
			totalSubmissions: processedSubmissions.length
		});

	} catch (err) {
		console.error('Failed to fetch submissions:', err);
		throw error(500, 'Failed to fetch submissions');
	}
};

// POST: Submit or update a rating
export const POST: RequestHandler = async ({ request, locals }) => {
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
		
		const hasAccess = !!badgeData;
		if (!hasAccess) {
			throw error(403, 'Award badge or admin role required for jury access');
		}
	}

	try {
		const body = await request.json();
		const { submissionId, rating, comments } = body;

		// Validate input
		if (!submissionId || !rating) {
			throw error(400, 'Missing required fields');
		}

		if (rating < 1 || rating > 10) {
			throw error(400, 'Rating must be between 1 and 10');
		}

		// Upsert rating in Supabase
		const { data, error: upsertError } = await typedLocals.supabase
			.from('jury_ratings')
			.upsert({
				submission_id: submissionId,
				juror_id: user.id,
				rating,
				comments: comments || null,
				updated_at: new Date().toISOString()
			}, {
				onConflict: 'submission_id,juror_id',
				ignoreDuplicates: false
			})
			.select()
			.single();

		if (upsertError) {
			console.error('Failed to save rating:', upsertError);
			throw error(500, 'Failed to save rating');
		}

		// Calculate new average rating for the submission
		const { data: avgData } = await typedLocals.supabase
			.from('submission_stats')
			.select('average_rating, total_ratings')
			.eq('submission_id', submissionId)
			.single();

		// Update the average rating in Sanity (optional)
		if (avgData?.average_rating) {
			try {
				await client
					.patch(submissionId)
					.set({ 
						juryRating: avgData.average_rating,
						totalRatings: avgData.total_ratings
					})
					.commit();
			} catch (sanityError) {
				// Log but don't fail the request
				console.error('Failed to update Sanity:', sanityError);
			}
		}

		return json({
			success: true,
			rating: data,
			stats: avgData
		});

	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		console.error('Failed to save rating:', err);
		throw error(500, 'Failed to save rating');
	}
};