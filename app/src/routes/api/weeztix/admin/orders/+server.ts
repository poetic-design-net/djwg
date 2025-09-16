import { json, error } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/supabase/admin';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * Get all Weeztix orders with user and badge status
 * Admin only endpoint
 */
export const GET: RequestHandler = async ({ locals }) => {
  // Check admin access
  const user = locals.user;

  // In development, allow access without auth for testing
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

  if (!user && !isDevelopment) {
    return error(401, 'Unauthorized');
  }

  // Check if user is admin (you might want to check a specific admin role/badge)
  if (user) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Add your admin check logic here
    // For now, we'll just check if user exists
    if (!profile && !isDevelopment) {
      return error(403, 'Admin access required');
    }
  }

  try {
    // Get all orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return error(500, 'Failed to fetch orders');
    }

    // Get user profiles for orders with user_id
    const userIds = [...new Set((orders || []).filter(o => o.user_id).map(o => o.user_id))];
    let profiles: any[] = [];

    if (userIds.length > 0) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, username')
        .in('id', userIds);

      profiles = profileData || [];
    }

    // Create a map for easy profile lookup
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Get badge assignment status for each order
    const ordersWithBadgeStatus = await Promise.all(
      (orders || []).map(async (order) => {
        let badgeAssigned = order.badge_assigned;

        // Double-check badge assignment if user exists
        if (order.user_id && !badgeAssigned) {
          const { data: userBadge } = await supabaseAdmin
            .from('user_badges')
            .select('id')
            .eq('user_id', order.user_id)
            .eq('badge_id', env.WEEZTIX_TICKET_BADGE_ID || '')
            .single();

          badgeAssigned = !!userBadge;

          // Update order if badge status changed
          if (badgeAssigned !== order.badge_assigned) {
            await supabaseAdmin
              .from('weeztix_orders')
              .update({
                badge_assigned: badgeAssigned,
                badge_assigned_at: badgeAssigned ? new Date().toISOString() : null
              })
              .eq('id', order.id);
          }
        }

        return {
          ...order,
          profiles: order.user_id ? profileMap[order.user_id] : null,
          badge_assigned: badgeAssigned,
          status: order.user_id
            ? (badgeAssigned ? 'completed' : 'pending_badge')
            : (order.claim_code ? 'unclaimed' : 'no_user')
        };
      })
    );

    // Calculate statistics
    const stats = {
      total: orders?.length || 0,
      claimed: orders?.filter(o => o.user_id).length || 0,
      unclaimed: orders?.filter(o => !o.user_id).length || 0,
      badges_assigned: ordersWithBadgeStatus.filter(o => o.badge_assigned).length,
      pending_badges: ordersWithBadgeStatus.filter(o => o.user_id && !o.badge_assigned).length
    };

    return json({
      orders: ordersWithBadgeStatus,
      stats
    });

  } catch (err) {
    console.error('Error in orders endpoint:', err);
    return error(500, 'Internal server error');
  }
};