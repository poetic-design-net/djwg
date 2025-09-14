import type { PageLoad } from './$types';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ data, parent }) => {
	// Get parent data for auth check
	await parent();

	// Return immediately with skeleton state
	if (browser) {
		// Progressive enhancement - load heavy data client-side
		return {
			...data,
			streaming: {
				videos: loadVideosAsync(data),
				badges: loadBadgesAsync(data),
				events: loadEventsAsync(data)
			}
		};
	}

	return data;
};

async function loadVideosAsync(data: any) {
	// Simulate async video loading
	if (data.videos?.data) {
		return data.videos;
	}
	return null;
}

async function loadBadgesAsync(data: any) {
	// Return badges data
	if (data.user?.badges) {
		return data.user.badges;
	}
	return [];
}

async function loadEventsAsync(data: any) {
	// Could load events here
	return [];
}