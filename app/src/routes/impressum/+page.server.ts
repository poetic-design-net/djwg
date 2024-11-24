import { legalPageQuery } from '$lib/sanity/queries/legal';
import { client } from '$lib/sanity/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const page = await client.fetch(legalPageQuery, { slug: 'impressum' });

  if (!page) {
    throw error(404, 'Page not found');
  }

  return {
    page
  };
};
