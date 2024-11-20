import type { PageServerLoad } from './$types';
import { eventQuery, artistsQuery, timeSlotsQuery } from '$lib/sanity/queries';
import { client } from '$lib/sanity/client';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const event = await client.fetch(eventQuery, { slug: params.slug });
  
  if (!event) {
    throw error(404, 'Event not found');
  }

  // Fetch artists
  const artists = await client.fetch(artistsQuery);

  // Fetch time slots for this event
  const timeSlots = await client.fetch(timeSlotsQuery, { eventId: event._id });

  return {
    event,
    artists: {
      data: artists || []
    },
    timeSlots: timeSlots || []
  };
};
