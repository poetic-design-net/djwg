import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	// Return data immediately for progressive enhancement
	return {
		...data,
		// Mark as streaming for skeleton states
		streaming: true
	};
};