import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

interface WeeztixOrderPayload {
  orderGuid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  ticketGuid?: string;
  reservationGuid?: string;
  eventDateGuid?: string;
  productGuid?: string;
  status?: string;
  items?: Array<{
    ticketGuid: string;
    productGuid: string;
    quantity: number;
  }>;
  timestamp?: string;
}

/**
 * Verify webhook signature from Weeztix
 */
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  const WEEZTIX_WEBHOOK_SECRET = env.WEEZTIX_WEBHOOK_SECRET;
  if (!WEEZTIX_WEBHOOK_SECRET || !signature) {
    console.warn('Webhook secret or signature missing, skipping verification');
    return true; // Allow in development if no secret is configured
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

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return error(401, 'Invalid signature');
    }

    let payload: WeeztixOrderPayload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON payload:', err);
      return error(400, 'Invalid payload');
    }

    console.log('Processing Weeztix webhook:', {
      orderGuid: payload.orderGuid,
      email: payload.email,
      status: payload.status
    });

    // Only process completed orders
    if (payload.status && payload.status !== 'completed' && payload.status !== 'paid') {
      console.log('Skipping non-completed order:', payload.status);
      return json({ received: true, processed: false });
    }

    // Store order in database
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('id, user_id, badge_assigned')
      .eq('order_guid', payload.orderGuid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing order:', fetchError);
      return error(500, 'Database error');
    }

    // If order already exists and badge is assigned, skip processing
    if (existingOrder?.badge_assigned) {
      console.log('Order already processed with badge assigned:', payload.orderGuid);
      return json({ received: true, processed: false, reason: 'already_processed' });
    }

    // Find user by email
    let userId: string | null = null;
    if (payload.email) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .eq('email', payload.email.toLowerCase())
        .single();

      if (!userError && userData) {
        userId = userData.id;
        console.log('Found user for email:', payload.email, 'userId:', userId);
      } else {
        console.log('No user found for email:', payload.email);
      }
    }

    // Insert or update order
    const orderData = {
      order_guid: payload.orderGuid,
      user_id: userId,
      user_email: payload.email.toLowerCase(),
      customer_firstname: payload.firstname || null,
      customer_lastname: payload.lastname || null,
      ticket_guid: payload.ticketGuid || payload.items?.[0]?.ticketGuid || null,
      reservation_guid: payload.reservationGuid || null,
      event_date_guid: payload.eventDateGuid || null,
      product_guid: payload.productGuid || payload.items?.[0]?.productGuid || null,
      webhook_data: payload,
      purchase_date: payload.timestamp ? new Date(payload.timestamp).toISOString() : new Date().toISOString()
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
            assigned_reason: `Weeztix Ticket Purchase - Order: ${payload.orderGuid}`
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
    }

    return json({
      received: true,
      processed: true,
      orderId: order.id,
      userId: userId,
      badgeAssigned: userId && WEEZTIX_TICKET_BADGE_ID ? true : false
    });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return error(500, 'Internal server error');
  }
};