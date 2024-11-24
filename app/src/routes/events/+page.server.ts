import { eventsQuery, eventPageQuery, type Event, type EventPage } from '$lib/sanity/queries/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { loadQuery } = event.locals;
	
	// Set cache headers - cache for 5 minutes
	event.setHeaders({
		'cache-control': 'public, max-age=0, s-maxage=300'
	});

	const events = await loadQuery<Event[]>(eventsQuery);
	const eventPage = await loadQuery<EventPage>(eventPageQuery);

	return {
		events: {
			query: eventsQuery,
			data: events,
			options: { initial: events }
		},
		eventPage: {
			query: eventPageQuery,
			data: eventPage,
			options: { initial: eventPage }
		}
	};
};
