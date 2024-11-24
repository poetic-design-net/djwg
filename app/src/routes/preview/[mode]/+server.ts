import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const redirectTo = url.searchParams.get('redirect') || '/';

	// Enable or disable preview mode
	if (params.mode === 'enable') {
		throw redirect(307, `${redirectTo}?preview=true`);
	}

	if (params.mode === 'disable') {
		throw redirect(307, redirectTo);
	}

	// Default fallback
	throw redirect(307, '/');
};
