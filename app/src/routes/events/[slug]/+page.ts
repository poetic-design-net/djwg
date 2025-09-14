import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	// Return data immediately for skeleton rendering
	return {
		...data,
		// Mark as streaming for progressive enhancement
		streaming: true
	};
};