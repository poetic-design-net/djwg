import { STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';
import { client } from '$lib/sanity/client';
import { z } from 'zod';

if (!STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-05-28.basil',
	typescript: true
});

const planSchema = z.object({
	_id: z.string(),
	key: z.string(),
	name: z.string(),
	description: z.string(),
	price: z.number(),
	originalPrice: z.number().optional(),
	interval: z.enum(['day', 'week', 'month', 'year']),
	intervalCount: z.number(),
	features: z.array(z.string()).optional()
});

export type PricingPlan = z.infer<typeof planSchema>;
const plansSchema = z.array(planSchema);

/**
 * Fetches pricing plans from Sanity.
 * @returns {Promise<PricingPlan[]>} A promise that resolves to an array of pricing plans.
 */
export async function getPricingPlans(): Promise<PricingPlan[]> {
	const query = `*[_type == "pricingPlan"]{
    _id,
    key,
    name,
    description,
    price,
    originalPrice,
    interval,
    intervalCount,
    features
  }`;

	const plans = await client.fetch(query);
	return plansSchema.parse(plans);
}

// NextLevel DJs Subscription Plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'nextlevel_monthly',
    name: '1 Monat',
    description: 'Monatlicher Zugang zu NextLevel DJs Academy',
    price: 3900, // 39€ in Cent
    originalPrice: 6900, // 69€ in Cent
    interval: 'month' as const,
    intervalCount: 1,
    trialDays: 0,
    features: [
      'Vollzugriff auf alle Videos',
      'Download aller Musikdateien',
      'Verschiedene Dateiformate',
      'Neue Inhalte jeden Monat',
      'Community Zugang'
    ]
  },
  quarterly: {
    id: 'nextlevel_quarterly', 
    name: '3 Monate',
    description: '3 Monate Zugang zu NextLevel DJs Academy',
    price: 8900, // 89€ in Cent
    originalPrice: 13900, // 139€ in Cent
    interval: 'month' as const,
    intervalCount: 3,
    trialDays: 0,
    features: [
      'Vollzugriff auf alle Videos',
      'Download aller Musikdateien', 
      'Verschiedene Dateiformate',
      'Neue Inhalte jeden Monat',
      'Community Zugang',
      '15% Ersparnis'
    ]
  },
  yearly: {
    id: 'nextlevel_yearly',
    name: '12 Monate', 
    description: 'Jährlicher Zugang zu NextLevel DJs Academy',
    price: 13900, // 139€ in Cent
    originalPrice: 34900, // 349€ in Cent
    interval: 'year' as const,
    intervalCount: 1,
    trialDays: 0,
    features: [
      'Vollzugriff auf alle Videos',
      'Download aller Musikdateien',
      'Verschiedene Dateiformate', 
      'Neue Inhalte jeden Monat',
      'Community Zugang',
      'Beste Ersparnis (60%)',
      'Prioritäts-Support'
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;