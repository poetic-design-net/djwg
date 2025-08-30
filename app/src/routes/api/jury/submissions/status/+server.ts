import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { client } from '$lib/sanity/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoaderLocals } from '@sanity/svelte-loader';

interface AppLocals extends LoaderLocals {
    supabase: SupabaseClient;
    getUser(): Promise<any>;
}

// PATCH: Update submission status (admin only)
export const PATCH: RequestHandler = async ({ request, locals }) => {
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

	if (!isAdmin) {
		throw error(403, 'Admin role required to update status');
	}

	try {
		const body = await request.json();
		const { submissionId, status } = body;

		// Validate input
		if (!submissionId || !status) {
			throw error(400, 'Missing required fields');
		}

		const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
		if (!validStatuses.includes(status)) {
			throw error(400, 'Invalid status value');
		}

		// Update status in Sanity
		const result = await client
			.patch(submissionId)
			.set({ status })
			.commit();

		if (!result) {
			throw error(500, 'Failed to update status in Sanity');
		}

		// Log the status change in Supabase for audit trail
		await typedLocals.supabase
			.from('jury_activity_log')
			.insert({
				user_id: user.id,
				action: 'status_change',
				submission_id: submissionId,
				details: {
					new_status: status,
					timestamp: new Date().toISOString()
				}
			});

		return json({
			success: true,
			status,
			updatedAt: new Date().toISOString()
		});

	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		console.error('Failed to update status:', err);
		throw error(500, 'Failed to update status');
	}
};