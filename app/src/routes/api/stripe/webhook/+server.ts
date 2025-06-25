import { json, error } from '@sveltejs/kit';
import { stripe } from '$lib/stripe/server';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

if (!STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return error(400, 'Missing stripe-signature header');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return error(400, 'Invalid signature');
    }

    console.log('Processing Stripe webhook event:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return error(500, 'Internal server error');
  }
};

async function handleSubscriptionCreated(subscription: any) {
  console.log('Handling subscription created:', subscription.id);
  
  const userId = subscription.metadata?.userId;
  const plan = subscription.metadata?.plan;
  
  if (!userId || !plan) {
    console.error('Missing metadata in subscription:', { userId, plan });
    return;
  }

  const { error: dbError } = await supabaseAdmin
    .from('nextlevel_subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      plan_type: plan,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata || {}
    });

  if (dbError) {
    console.error('Error creating subscription in database:', dbError);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Handling subscription updated:', subscription.id);
  
  const { error: dbError } = await supabaseAdmin
    .from('nextlevel_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata || {}
    })
    .eq('stripe_subscription_id', subscription.id);

  if (dbError) {
    console.error('Error updating subscription in database:', dbError);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Handling subscription deleted:', subscription.id);
  
  const { error: dbError } = await supabaseAdmin
    .from('nextlevel_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false
    })
    .eq('stripe_subscription_id', subscription.id);

  if (dbError) {
    console.error('Error marking subscription as canceled:', dbError);
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Handling invoice payment succeeded:', invoice.id);
  
  if (invoice.subscription) {
    // Abonnement als aktiv markieren
    const { error: dbError } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .update({
        status: 'active'
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (dbError) {
      console.error('Error updating subscription status to active:', dbError);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Handling invoice payment failed:', invoice.id);
  
  if (invoice.subscription) {
    // Abonnement als past_due markieren
    const { error: dbError } = await supabaseAdmin
      .from('nextlevel_subscriptions')
      .update({
        status: 'past_due'
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (dbError) {
      console.error('Error updating subscription status to past_due:', dbError);
    }
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Handling checkout session completed:', session.id);
  
  if (session.mode === 'subscription' && session.subscription) {
    const userId = session.metadata?.userId;
    
    if (userId) {
      // NextLevel Badge zuweisen wenn Zahlung erfolgreich
      try {
        const NEXTLEVEL_BADGE_ID = 'b43630a1-86b3-43d2-9fd2-76857a122afd';
        
        const { error: badgeError } = await supabaseAdmin
          .from('user_badges')
          .upsert({
            user_id: userId,
            badge_id: NEXTLEVEL_BADGE_ID,
            assigned_at: new Date().toISOString(),
            assigned_by: 'system',
            assignment_reason: 'NextLevel DJs Subscription'
          }, {
            onConflict: 'user_id,badge_id'
          });
        
        if (badgeError) {
          console.error('Error assigning NextLevel badge:', badgeError);
        } else {
          console.log('NextLevel badge assigned to user:', userId);
        }
      } catch (badgeErr) {
        console.error('Error in badge assignment:', badgeErr);
      }
    }
  }
}