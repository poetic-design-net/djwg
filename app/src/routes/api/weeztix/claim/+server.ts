import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WeeztixClaimService } from '$lib/services/weeztix-claim';

/**
 * Claim a Weeztix order with a claim code
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    const user = locals.user;
    if (!user) {
      return error(401, 'Authentication required');
    }

    const { claimCode } = await request.json();

    if (!claimCode || typeof claimCode !== 'string') {
      return error(400, 'Invalid claim code');
    }

    // Attempt to claim the order
    const success = await WeeztixClaimService.claimOrderWithCode(
      user.id,
      claimCode.trim().toUpperCase()
    );

    if (!success) {
      return json({
        success: false,
        message: 'Invalid or already claimed code'
      }, { status: 400 });
    }

    return json({
      success: true,
      message: 'Ticket successfully claimed! Your badge has been assigned.'
    });

  } catch (err) {
    console.error('Claim endpoint error:', err);
    return error(500, 'Failed to process claim');
  }
};

/**
 * Check for unclaimed orders for the authenticated user
 */
export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is authenticated
    const user = locals.user;
    if (!user) {
      return error(401, 'Authentication required');
    }

    // Check for unclaimed orders
    const unclaimedOrders = await WeeztixClaimService.checkUnclaimedOrders(user.email);

    // Auto-claim if any found
    if (unclaimedOrders.length > 0) {
      const claimedCount = await WeeztixClaimService.autoClaimOrdersForUser(
        user.id,
        user.email
      );

      return json({
        found: unclaimedOrders.length,
        claimed: claimedCount,
        message: `${claimedCount} ticket(s) automatically claimed!`
      });
    }

    return json({
      found: 0,
      claimed: 0,
      message: 'No unclaimed tickets found for your email'
    });

  } catch (err) {
    console.error('Check unclaimed error:', err);
    return error(500, 'Failed to check unclaimed orders');
  }
};