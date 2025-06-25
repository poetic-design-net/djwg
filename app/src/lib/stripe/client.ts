import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

if (!PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};