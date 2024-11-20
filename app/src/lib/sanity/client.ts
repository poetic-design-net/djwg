import { createClient } from '@sanity/client';
import { apiVersion, projectId, dataset, studioUrl } from '$lib/sanity/api';

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: import.meta.env.SANITY_API_READ_TOKEN,
	stega: {
		studioUrl
	}
});
