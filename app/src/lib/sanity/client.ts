import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset, studioUrl } from '$lib/sanity/api';

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	token: import.meta.env.SANITY_API_READ_TOKEN,
	stega: {
		studioUrl
	},
	perspective: 'published',
	ignoreBrowserTokenWarning: true
});
