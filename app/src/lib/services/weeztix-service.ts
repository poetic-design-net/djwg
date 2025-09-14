import type { SupabaseClient } from '@supabase/supabase-js';
// Environment variables are passed through constructor to avoid import issues

export interface WeeztixOrder {
  orderGuid: string;
  email: string;
  firstname?: string;
  lastname?: string;
  ticketGuid?: string;
  reservationGuid?: string;
  eventDateGuid?: string;
  productGuid?: string;
  status?: string;
  createdAt?: string;
}

export interface WeeztixWebhookConfig {
  url: string;
  events: string[];
  active: boolean;
}

/**
 * Service for interacting with Weeztix API
 */
export class WeeztixService {
  private apiBase = 'https://shop.api.weeztix.com';
  private shopGuid: string;
  private apiKey: string;

  constructor(apiKey?: string, shopGuid?: string) {
    this.apiKey = apiKey || '';
    this.shopGuid = shopGuid || '';
    if (!this.apiKey || !this.shopGuid) {
      console.warn('Weeztix API credentials not configured');
    }
  }

  /**
   * Get order details from Weeztix API
   */
  async getOrder(orderGuid: string): Promise<WeeztixOrder | null> {
    if (!this.apiKey || !this.shopGuid) {
      console.error('Weeztix API not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.apiBase}/${this.shopGuid}/order/${orderGuid}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch order from Weeztix:', response.status);
        return null;
      }

      const data = await response.json();
      return this.mapOrderResponse(data);
    } catch (error) {
      console.error('Error fetching order from Weeztix:', error);
      return null;
    }
  }

  /**
   * Register webhook endpoint with Weeztix
   * Note: This might need to be done manually through Weeztix dashboard
   */
  async registerWebhook(config: WeeztixWebhookConfig): Promise<boolean> {
    if (!this.apiKey || !this.shopGuid) {
      console.error('Weeztix API not configured');
      return false;
    }

    try {
      // The actual endpoint for webhook registration needs to be confirmed with Weeztix
      const response = await fetch(
        `${this.apiBase}/${this.shopGuid}/webhooks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(config)
        }
      );

      if (!response.ok) {
        console.error('Failed to register webhook:', response.status);
        return false;
      }

      console.log('Webhook registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering webhook:', error);
      return false;
    }
  }

  /**
   * Map Weeztix API response to our order format
   */
  private mapOrderResponse(data: any): WeeztixOrder {
    return {
      orderGuid: data.guid || data.orderGuid,
      email: data.receiver?.email || data.email,
      firstname: data.receiver?.firstname || data.firstname,
      lastname: data.receiver?.lastname || data.lastname,
      ticketGuid: data.ticketGuid,
      reservationGuid: data.reservationGuid,
      eventDateGuid: data.eventDateGuid,
      productGuid: data.productGuid,
      status: data.status || 'completed',
      createdAt: data.createdAt || new Date().toISOString()
    };
  }
}

/**
 * Check if a user has purchased a Weeztix ticket
 */
export async function checkUserWeeztixPurchase(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('weeztix_orders')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking Weeztix purchase:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking Weeztix purchase:', error);
    return false;
  }
}

/**
 * Get all Weeztix orders for a user
 */
export async function getUserWeeztixOrders(
  supabase: SupabaseClient,
  userId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('weeztix_orders')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Error fetching user Weeztix orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user Weeztix orders:', error);
    return [];
  }
}

/**
 * Manually assign Weeztix badge to a user
 * This can be used for manual badge assignment or retry logic
 */
export async function assignWeeztixBadge(
  supabase: SupabaseClient,
  userId: string,
  badgeId: string,
  orderGuid?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .upsert({
        user_id: userId,
        badge_id: badgeId,
        assigned_at: new Date().toISOString(),
        assigned_reason: orderGuid
          ? `Weeztix Ticket Purchase - Order: ${orderGuid}`
          : 'Weeztix Ticket Purchase'
      }, {
        onConflict: 'user_id,badge_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error assigning Weeztix badge:', error);
      return false;
    }

    console.log('Weeztix badge assigned successfully to user:', userId);
    return true;
  } catch (error) {
    console.error('Error assigning Weeztix badge:', error);
    return false;
  }
}