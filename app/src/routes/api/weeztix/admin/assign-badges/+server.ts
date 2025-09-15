import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * Bulk assign badges to all users with Weeztix orders
 */
export const POST: RequestHandler = async ({ locals }) => {
  // Check admin access
  const user = locals.user;
  if (!user) {
    return error(401, 'Unauthorized');
  }

  const WEEZTIX_TICKET_BADGE_ID = env.WEEZTIX_TICKET_BADGE_ID;
  if (!WEEZTIX_TICKET_BADGE_ID) {
    return error(400, 'Weeztix badge ID not configured');
  }

  try {
    // Get all orders with user_id but no badge assigned
    const { data: pendingOrders, error: ordersError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('*')
      .not('user_id', 'is', null)
      .eq('badge_assigned', false);

    if (ordersError) {
      console.error('Error fetching pending orders:', ordersError);
      return error(500, 'Failed to fetch orders');
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      return json({
        success: true,
        message: 'No pending badge assignments',
        assigned: 0,
        skipped: 0,
        errors: 0
      });
    }

    // Group orders by user_id
    const ordersByUser = pendingOrders.reduce((acc, order) => {
      if (!acc[order.user_id]) {
        acc[order.user_id] = [];
      }
      acc[order.user_id].push(order);
      return acc;
    }, {} as Record<string, typeof pendingOrders>);

    let assigned = 0;
    let skipped = 0;
    let errors = 0;
    const results = [];

    // Process each user
    for (const [userId, userOrders] of Object.entries(ordersByUser)) {
      try {
        // Check if badge already assigned
        const { data: existingBadge } = await supabaseAdmin
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_id', WEEZTIX_TICKET_BADGE_ID)
          .single();

        if (existingBadge) {
          skipped++;

          // Update orders to reflect badge is assigned
          for (const order of userOrders) {
            await supabaseAdmin
              .from('weeztix_orders')
              .update({
                badge_assigned: true,
                badge_assigned_at: new Date().toISOString()
              })
              .eq('id', order.id);
          }

          results.push({
            userId,
            status: 'skipped',
            reason: 'Badge already assigned'
          });
          continue;
        }

        // Assign badge
        const { error: badgeError } = await supabaseAdmin
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: WEEZTIX_TICKET_BADGE_ID,
            assigned_at: new Date().toISOString(),
            assigned_reason: `Weeztix Ticket Purchase - Bulk assignment by admin ${user.email}`
          });

        if (badgeError) {
          console.error(`Error assigning badge to user ${userId}:`, badgeError);
          errors++;
          results.push({
            userId,
            status: 'error',
            error: badgeError.message
          });
        } else {
          assigned++;

          // Update all orders for this user
          for (const order of userOrders) {
            await supabaseAdmin
              .from('weeztix_orders')
              .update({
                badge_assigned: true,
                badge_assigned_at: new Date().toISOString()
              })
              .eq('id', order.id);
          }

          results.push({
            userId,
            status: 'assigned',
            orderCount: userOrders.length
          });
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors++;
        results.push({
          userId,
          status: 'error',
          error: 'Processing error'
        });
      }
    }

    return json({
      success: true,
      message: `Processed ${Object.keys(ordersByUser).length} users`,
      assigned,
      skipped,
      errors,
      results
    });

  } catch (err) {
    console.error('Error in bulk assignment:', err);
    return error(500, 'Internal server error');
  }
};