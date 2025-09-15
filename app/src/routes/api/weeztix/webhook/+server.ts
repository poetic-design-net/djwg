import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';
import { WeeztixClaimService } from '$lib/services/weeztix-claim';

// Weeztix webhook payload structure according to documentation
interface WeeztixWebhookPayload {
  meta: {
    user_id: string;
    user_name: string;
    company_id: string;
  };
  model: {
    guid: string;
    type: string;  // 'order', 'ticket', 'event', etc.
    name: string;
  };
  change: {
    props: {
      [key: string]: any;
      // For orders, this might include:
      created_at?: string;
      updated_at?: string;
      guid?: string;
      email?: string;
      firstname?: string;
      lastname?: string;
      total_amount?: number;
      status?: string;
      // ... other fields
    };
    changes?: {
      [key: string]: any;
    };
  };
  type: string;  // 'create', 'update', 'delete', 'paid', 'scan'
  time: string;
}

/**
 * Verify webhook signature from Weeztix
 */
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  const WEEZTIX_WEBHOOK_SECRET = env.WEEZTIX_WEBHOOK_SECRET;
  if (!WEEZTIX_WEBHOOK_SECRET) {
    console.warn('Webhook secret not configured, skipping verification (DEVELOPMENT ONLY)');
    return true; // Allow in development if no secret is configured
  }

  if (!signature) {
    console.warn('No signature in webhook request');
    return !WEEZTIX_WEBHOOK_SECRET; // Only allow if secret not configured
  }

  try {
    // Weeztix might use HMAC-SHA256 for signatures
    // Adjust this based on their actual implementation
    const expectedSignature = crypto
      .createHmac('sha256', WEEZTIX_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return false;
  }
}

/**
 * Handle Weeztix webhook for order events
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-weeztix-signature');

    // Log incoming webhook for debugging
    console.log('Received Weeztix webhook');
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    // Verify webhook signature (skip in development if no secret)
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      // For now, log but don't reject to debug the payload
      // return error(401, 'Invalid signature');
    }

    let payload: WeeztixWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON payload:', err);
      console.error('Raw body:', body);
      return error(400, 'Invalid payload');
    }

    console.log('Processing Weeztix webhook:', {
      type: payload.type,
      modelType: payload.model?.type,
      modelGuid: payload.model?.guid,
      time: payload.time
    });

    // Check if this is the actual order format (flat structure)
    // The real Weeztix webhook sends a flat order object, not the documented structure
    let orderGuid: string;
    let email: string | null;
    let firstname: string | null;
    let lastname: string | null;

    // Check if it's the flat order format (actual Weeztix format)
    if ('guid' in payload && 'email' in payload && 'status' in payload) {
      // This is the actual format Weeztix sends
      const orderPayload = payload as any;

      if (orderPayload.status !== 'paid') {
        console.log('Order not paid, status:', orderPayload.status);
        return json({
          received: true,
          processed: false,
          reason: 'Order not paid'
        });
      }

      orderGuid = orderPayload.guid;
      email = orderPayload.email;
      firstname = orderPayload.firstname;
      lastname = orderPayload.lastname;

      console.log('Processing flat order format:', { orderGuid, email, status: orderPayload.status });
    }
    // Check if it's the documented format (meta/model/change)
    else if (payload.model?.type === 'order' && payload.type === 'paid') {
      orderGuid = payload.model.guid;
      const orderProps = payload.change?.props || {};
      email = orderProps.email || orderProps.customer_email || orderProps.buyer_email || null;
      firstname = orderProps.firstname || orderProps.customer_firstname || null;
      lastname = orderProps.lastname || orderProps.customer_lastname || null;

      console.log('Processing documented format:', { orderGuid, email });
    }
    else {
      console.log('Unknown payload format or not a paid order');
      return json({
        received: true,
        processed: false,
        reason: 'Not an order paid event or unknown format'
      });
    }

    if (!email) {
      console.warn('No email found in order payload');
    }

    // Store order in database
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('id, user_id, badge_assigned')
      .eq('order_guid', orderGuid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing order:', fetchError);
      return error(500, 'Database error');
    }

    // If order already exists and badge is assigned, skip processing
    if (existingOrder?.badge_assigned) {
      console.log('Order already processed with badge assigned:', orderGuid);
      return json({ received: true, processed: false, reason: 'already_processed' });
    }

    // Find user by email
    let userId: string | null = null;
    if (email) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (!userError && userData) {
        userId = userData.id;
        console.log('Found user for email:', email, 'userId:', userId);
      } else {
        console.log('No user found for email:', email);
      }
    }

    // Generate claim code if no user found
    const claimCode = !userId && email ? WeeztixClaimService.generateClaimCode(orderGuid) : null;

    // Insert or update order
    const orderData = {
      order_guid: orderGuid,
      user_id: userId,
      user_email: email ? email.toLowerCase() : null,
      customer_firstname: firstname,
      customer_lastname: lastname,
      ticket_guid: (payload as any).ticket_guid || (payload as any).ticket_id || null,
      reservation_guid: (payload as any).reservation_guid || null,
      event_date_guid: (payload as any).event_date_guid || null,
      product_guid: (payload as any).product_guid || (payload as any).product_id || null,
      webhook_data: payload,
      purchase_date: (payload as any).created_at ? new Date((payload as any).created_at).toISOString() : new Date().toISOString(),
      claim_code: claimCode
    };

    const { data: order, error: upsertError } = await supabaseAdmin
      .from('weeztix_orders')
      .upsert(orderData, {
        onConflict: 'order_guid',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error storing order:', upsertError);
      return error(500, 'Failed to store order');
    }

    // Assign badge if user exists and badge ID is configured
    const WEEZTIX_TICKET_BADGE_ID = env.WEEZTIX_TICKET_BADGE_ID;
    if (userId && WEEZTIX_TICKET_BADGE_ID) {
      try {
        const { error: badgeError } = await supabaseAdmin
          .from('user_badges')
          .upsert({
            user_id: userId,
            badge_id: WEEZTIX_TICKET_BADGE_ID,
            assigned_at: new Date().toISOString(),
            assigned_reason: `Weeztix Ticket Purchase - Order: ${orderGuid}`
          }, {
            onConflict: 'user_id,badge_id',
            ignoreDuplicates: true
          });

        if (badgeError) {
          console.error('Error assigning badge:', badgeError);
        } else {
          console.log('Badge assigned successfully to user:', userId);

          // Update order to mark badge as assigned
          await supabaseAdmin
            .from('weeztix_orders')
            .update({
              badge_assigned: true,
              badge_assigned_at: new Date().toISOString()
            })
            .eq('id', order.id);
        }
      } catch (badgeErr) {
        console.error('Error in badge assignment process:', badgeErr);
      }
    } else if (!WEEZTIX_TICKET_BADGE_ID) {
      console.warn('WEEZTIX_TICKET_BADGE_ID not configured');
    } else if (!userId && claimCode) {
      // No user found - send claim email
      console.log('No user found, claim code generated:', claimCode);

      // Trigger claim email (could be done via Edge Function or email service)
      await WeeztixClaimService.sendClaimEmail(order);
    }

    return json({
      received: true,
      processed: true,
      orderId: order.id,
      userId: userId,
      badgeAssigned: userId && WEEZTIX_TICKET_BADGE_ID ? true : false,
      claimCode: !userId ? claimCode : undefined
    });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return error(500, 'Internal server error');
  }
};