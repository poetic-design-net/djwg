import { supabaseAdmin } from '$lib/supabase/admin';
import { env } from '$env/dynamic/private';

/**
 * Weeztix Ticket Claim Service
 * Allows users to claim tickets purchased with different email addresses
 */
export class WeeztixClaimService {

  /**
   * Generate a unique claim code for an order
   */
  static generateClaimCode(orderGuid: string): string {
    // Create a simple but unique claim code
    const hash = orderGuid.substring(0, 8).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `WZ-${hash}-${random}`;
  }

  /**
   * Check for unclaimed orders for a given email
   */
  static async checkUnclaimedOrders(email: string): Promise<any[]> {
    const { data: orders, error } = await supabaseAdmin
      .from('weeztix_orders')
      .select('*')
      .eq('user_email', email.toLowerCase())
      .is('user_id', null)
      .eq('badge_assigned', false);

    if (error) {
      console.error('Error checking unclaimed orders:', error);
      return [];
    }

    return orders || [];
  }

  /**
   * Claim an order with a claim code
   */
  static async claimOrderWithCode(userId: string, claimCode: string): Promise<boolean> {
    try {
      // Find order by claim code
      const { data: order, error: findError } = await supabaseAdmin
        .from('weeztix_orders')
        .select('*')
        .eq('claim_code', claimCode)
        .is('user_id', null)
        .single();

      if (findError || !order) {
        console.error('Order not found for claim code:', claimCode);
        return false;
      }

      // Update order with user ID
      const { error: updateError } = await supabaseAdmin
        .from('weeztix_orders')
        .update({
          user_id: userId,
          claimed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error claiming order:', updateError);
        return false;
      }

      // Assign badge
      await WeeztixClaimService.assignBadge(userId, order.order_guid);

      return true;
    } catch (err) {
      console.error('Error in claim process:', err);
      return false;
    }
  }

  /**
   * Auto-claim orders on user registration/login
   */
  static async autoClaimOrdersForUser(userId: string, email: string): Promise<number> {
    try {
      // Find all unclaimed orders for this email
      const unclaimedOrders = await this.checkUnclaimedOrders(email);

      if (unclaimedOrders.length === 0) {
        return 0;
      }

      console.log(`Found ${unclaimedOrders.length} unclaimed orders for ${email}`);

      let claimedCount = 0;

      for (const order of unclaimedOrders) {
        // Update order with user ID
        const { error: updateError } = await supabaseAdmin
          .from('weeztix_orders')
          .update({
            user_id: userId,
            claimed_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (!updateError) {
          // Assign badge
          await this.assignBadge(userId, order.order_guid);
          claimedCount++;
        }
      }

      console.log(`Successfully claimed ${claimedCount} orders for user ${userId}`);
      return claimedCount;

    } catch (err) {
      console.error('Error auto-claiming orders:', err);
      return 0;
    }
  }

  /**
   * Assign badge to user
   */
  static async assignBadge(userId: string, orderGuid: string): Promise<boolean> {
    const WEEZTIX_TICKET_BADGE_ID = env.WEEZTIX_TICKET_BADGE_ID;

    if (!WEEZTIX_TICKET_BADGE_ID) {
      console.warn('WEEZTIX_TICKET_BADGE_ID not configured');
      return false;
    }

    try {
      // Assign badge
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
        return false;
      }

      // Mark order as badge assigned
      await supabaseAdmin
        .from('weeztix_orders')
        .update({
          badge_assigned: true,
          badge_assigned_at: new Date().toISOString()
        })
        .eq('order_guid', orderGuid);

      console.log('Badge assigned successfully to user:', userId);
      return true;

    } catch (err) {
      console.error('Error in badge assignment:', err);
      return false;
    }
  }

  /**
   * Send claim email to ticket purchaser
   */
  static async sendClaimEmail(order: any): Promise<void> {
    // This could trigger an Edge Function to send email
    const claimCode = this.generateClaimCode(order.order_guid);

    // Update order with claim code
    await supabaseAdmin
      .from('weeztix_orders')
      .update({ claim_code: claimCode })
      .eq('id', order.id);

    // Trigger email via Edge Function or email service
    console.log(`Claim email would be sent to ${order.user_email} with code: ${claimCode}`);

    // Example email content:
    // Subject: "Dein DJ Workshop Germany Ticket - Badge verfügbar!"
    // Body:
    // "Hallo ${order.customer_firstname},
    //
    //  vielen Dank für deinen Ticketkauf!
    //
    //  Um dein Workshop Partner Badge zu erhalten:
    //  1. Registriere dich auf djworkshopgermany.de
    //  2. Nutze diesen Code: ${claimCode}
    //
    //  Oder klicke hier: https://djworkshopgermany.de/claim?code=${claimCode}
    //
    //  Dein DJ Workshop Germany Team"
  }
}