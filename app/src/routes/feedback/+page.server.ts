import { testimonialsQuery } from '$lib/sanity/queries';
import { client } from '$lib/sanity/client';

export async function load() {
  const data = await client.fetch(testimonialsQuery);
  return {
    testimonials: {
      data
    }
  };
}
