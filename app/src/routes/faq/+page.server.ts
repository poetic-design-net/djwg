import type { PageServerLoad } from './$types';
import { faqsQuery } from '$lib/sanity/queries';
import { client } from '$lib/sanity/client';
import type { FAQ } from '$lib/sanity/queries';

export const load = (async () => {
  const faqs = await client.fetch<FAQ[]>(faqsQuery);
  return {
    faqs: faqs || []
  };
}) satisfies PageServerLoad;
