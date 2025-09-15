import { env } from '$env/dynamic/private';
import { supabaseAdmin } from '$lib/supabase/admin';
import { WeeztixOAuthService } from './weeztix-oauth';

interface WeeztixToken {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

/**
 * Weeztix API Service
 * Handles authenticated API requests to Weeztix
 */
export class WeeztixAPIService {
  private oauth: WeeztixOAuthService;
  private baseUrl = 'https://api.weeztix.com';

  constructor() {
    this.oauth = new WeeztixOAuthService(
      env.WEEZTIX_CLIENT_ID,
      env.WEEZTIX_CLIENT_SECRET,
      env.WEEZTIX_REDIRECT_URI
    );
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidToken(): Promise<string | null> {
    try {
      // Fetch stored token from database
      const { data: tokenData, error } = await supabaseAdmin
        .from('weeztix_tokens')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error || !tokenData) {
        console.error('No stored token found');
        return null;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null;

      if (expiresAt && expiresAt > now) {
        // Token is still valid
        return tokenData.access_token;
      }

      // Token expired, try to refresh
      if (tokenData.refresh_token) {
        console.log('Token expired, refreshing...');
        const newToken = await this.oauth.refreshToken(tokenData.refresh_token);

        if (newToken) {
          // Update stored token
          await supabaseAdmin
            .from('weeztix_tokens')
            .update({
              access_token: newToken.access_token,
              refresh_token: newToken.refresh_token || tokenData.refresh_token,
              expires_at: new Date(Date.now() + newToken.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', 'default');

          return newToken.access_token;
        }
      }

      console.error('Failed to refresh token');
      return null;
    } catch (err) {
      console.error('Error getting valid token:', err);
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response | null> {
    const token = await this.getValidToken();

    if (!token) {
      console.error('No valid token available for API request');
      return null;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const companyGuid = env.WEEZTIX_COMPANY_GUID || env.WEEZTIX_SHOP_GUID;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(companyGuid ? { 'Company': companyGuid } : {}),
          ...options.headers
        }
      });

      if (response.status === 401) {
        console.error('Authentication failed - token may be invalid');
        // Could trigger re-authentication flow here
      }

      return response;
    } catch (err) {
      console.error('API request failed:', err);
      return null;
    }
  }

  /**
   * Register webhook with Weeztix
   */
  async registerWebhook(webhookUrl: string): Promise<boolean> {
    try {
      console.log('Registering webhook with Weeztix:', webhookUrl);

      const response = await this.request('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url: webhookUrl,
          events: [
            'order.completed',
            'order.paid',
            'order.created',
            'ticket.validated'
          ],
          active: true,
          description: 'DJ Workshop Germany - Badge Assignment Webhook'
        })
      });

      if (!response) {
        console.error('No response from webhook registration');
        return false;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook registration failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('Webhook registered successfully:', result);
      return true;

    } catch (err) {
      console.error('Error registering webhook:', err);
      return false;
    }
  }

  /**
   * List registered webhooks
   */
  async listWebhooks(): Promise<any[] | null> {
    try {
      const response = await this.request('/webhooks', {
        method: 'GET'
      });

      if (!response || !response.ok) {
        console.error('Failed to list webhooks');
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error('Error listing webhooks:', err);
      return null;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      const response = await this.request(`/webhooks/${webhookId}`, {
        method: 'DELETE'
      });

      if (!response || !response.ok) {
        console.error('Failed to delete webhook');
        return false;
      }

      console.log('Webhook deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting webhook:', err);
      return false;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<any | null> {
    try {
      const response = await this.request('/users/me', {
        method: 'GET'
      });

      if (!response || !response.ok) {
        console.error('Failed to get user info');
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting user info:', err);
      return null;
    }
  }
}

// Export singleton instance
export const weeztixAPI = new WeeztixAPIService();