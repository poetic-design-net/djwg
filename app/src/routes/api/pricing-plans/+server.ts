import { json } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import { pricingPlansQuery } from '$lib/sanity/queries/pricingPlans';
import type { PricingPlan } from '$lib/sanity/queries/pricingPlans';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const plans = await client.fetch<PricingPlan[]>(pricingPlansQuery);
    return json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return json(
      { error: 'Fehler beim Laden der Preispläne' },
      { status: 500 }
    );
  }
};
