import { json, error } from '@sveltejs/kit';
import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '$lib/stripe/server';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, url }) => {
  try {
    const { plan } = await request.json();
    
    if (!locals.user) {
      return error(401, 'Nicht authentifiziert');
    }

    if (!plan || !(plan in SUBSCRIPTION_PLANS)) {
      return error(400, 'Ungültiger Preisplan');
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as SubscriptionPlan];
    const userId = locals.user.id;

    // E-Mail-Adresse aus der Supabase auth.users Tabelle abrufen
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user?.email) {
      return error(400, 'Benutzer-E-Mail-Adresse nicht gefunden');
    }
    
    const userEmail = userData.user.email;

    // Prüfen ob bereits ein aktives Abonnement existiert
    const { data: existingSub } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (existingSub) {
      return error(400, 'Bereits ein aktives Abonnement vorhanden');
    }

    // Stripe Customer erstellen oder abrufen
    let customerId: string;
    
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
    }

    // Stripe Product und Price erstellen/abrufen
    let priceId: string;
    
    try {
      const products = await stripe.products.list({
        ids: [planConfig.id],
        limit: 1
      });

      let product;
      if (products.data.length === 0) {
        product = await stripe.products.create({
          id: planConfig.id,
          name: `NextLevel DJs Academy - ${planConfig.name}`,
          description: planConfig.description,
          metadata: {
            plan: plan
          }
        });
      } else {
        product = products.data[0];
      }

      const prices = await stripe.prices.list({
        product: product.id,
        limit: 1
      });

      if (prices.data.length === 0) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: planConfig.price,
          currency: 'eur',
          recurring: {
            interval: planConfig.interval,
            interval_count: planConfig.intervalCount
          },
          metadata: {
            plan: plan,
            originalPrice: planConfig.originalPrice.toString()
          }
        });
        priceId = price.id;
      } else {
        priceId = prices.data[0].id;
      }
    } catch (stripeError) {
      console.error('Stripe product/price error:', stripeError);
      return error(500, 'Fehler bei der Preiserstellung');
    }

    // Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'sepa_debit', 'giropay'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${url.origin}/nextlevel-djs/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/nextlevel-djs?canceled=true`,
      metadata: {
        userId: userId,
        plan: plan
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    return json({ 
      sessionUrl: session.url,
      sessionId: session.id
    });

  } catch (err) {
    console.error('Checkout session error:', err);
    return error(500, 'Fehler beim Erstellen der Checkout-Session');
  }
};