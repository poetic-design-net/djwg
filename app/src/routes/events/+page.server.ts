import { eventsQuery, type Event } from '$lib/sanity/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { loadQuery } = event.locals;
	const events = await loadQuery<Event[]>(eventsQuery);

	return {
		events: {
			query: eventsQuery,
			data: events,
			options: { initial: events }
		}
	};
};
