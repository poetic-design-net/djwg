import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * Check specific user for Weeztix orders and optionally assign badge
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  // Check admin access
  const user = locals.user;

  // In development, allow access without auth for testing
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  if (!user && !isDevelopment) {
    return error(401, 'Unauthorized');
  }

  try {
    const { email, autoAssignBadge = false } = await request.json();

    if (!email) {
      return error(400, 'Email is required');
    }

    // Find user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      return json({
        success: false,
        message: 'User not found',
        orders: []
      });
    }

    // Find orders for this user (both by user_id and email)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('*')
      .or(`user_id.eq.${userData.id},user_email.eq.${email.toLowerCase()}`);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return error(500, 'Failed to fetch orders');
    }

    // Update orders that don't have user_id set
    const ordersToUpdate = orders?.filter(o => !o.user_id && o.user_email === email.toLowerCase()) || [];
    for (const order of ordersToUpdate) {
      await supabaseAdmin
        .from('weeztix_orders')
        .update({
          user_id: userData.id,
          claim_code: null // Clear claim code since user is now linked
        })
        .eq('id', order.id);
    }

    // Auto-assign badge if requested and configured
    let badgeAssigned = false;
    if (autoAssignBadge && env.WEEZTIX_TICKET_BADGE_ID && orders && orders.length > 0) {
      // Check if badge already assigned
      const { data: existingBadge } = await supabaseAdmin
        .from('user_badges')
        .select('id')
        .eq('user_id', userData.id)
        .eq('badge_id', env.WEEZTIX_TICKET_BADGE_ID)
        .single();

      if (!existingBadge) {
        // Assign badge
        const { error: badgeError } = await supabaseAdmin
          .from('user_badges')
          .upsert({
            user_id: userData.id,
            badge_id: env.WEEZTIX_TICKET_BADGE_ID,
            assigned_at: new Date().toISOString(),
            assigned_reason: `Weeztix Ticket Purchase - Manual check by admin ${user?.email || 'development'}`
          }, {
            onConflict: 'user_id,badge_id',
            ignoreDuplicates: true
          });

        if (!badgeError) {
          badgeAssigned = true;

          // Update all orders to mark badge as assigned
          for (const order of orders) {
            await supabaseAdmin
              .from('weeztix_orders')
              .update({
                badge_assigned: true,
                badge_assigned_at: new Date().toISOString()
              })
              .eq('id', order.id);
          }
        } else {
          console.error('Error assigning badge:', badgeError);
        }
      } else {
        badgeAssigned = true; // Already has badge
      }
    }

    return json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email
      },
      orders: orders || [],
      badgeAssigned,
      ordersUpdated: ordersToUpdate.length,
      message: orders && orders.length > 0
        ? `Found ${orders.length} order(s) for ${email}`
        : `No orders found for ${email}`
    });

  } catch (err) {
    console.error('Error checking user:', err);
    return error(500, 'Internal server error');
  }
};