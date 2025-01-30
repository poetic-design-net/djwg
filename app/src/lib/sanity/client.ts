import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset, studioUrl } from '$lib/sanity/api';

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: import.meta.env.DEV ? false : true, // Disable CDN caching in development
	token: import.meta.env.SANITY_API_WRITE_TOKEN, // Verwende Write-Token für Uploads
	stega: {
		studioUrl
	},
	perspective: 'published',
	ignoreBrowserTokenWarning: true
});
