import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { client } from '$lib/sanity/client';
import { merchPageQuery } from '$lib/sanity/queries/merch';
import type { MerchPage } from '$lib/types/merch';

export const load: PageServerLoad = async () => {
  try {
    const merchPage = await client.fetch<MerchPage>(merchPageQuery);

    if (!merchPage) {
      throw error(404, 'Merch page not found');
    }

    return {
      merchPage
    };
  } catch (err) {
    console.error('Error loading merch page:', err);
    throw error(500, 'Error loading merch page');
  }
};