import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { WeeztixOAuthService } from '$lib/services/weeztix-oauth';
import { supabaseAdmin } from '$lib/supabase/admin';

/**
 * OAuth2 callback handler for Weeztix
 * Receives the authorization code and exchanges it for an access token
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    // Get the authorization code from the query parameters
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth errors
    if (errorParam) {
      console.error('OAuth error:', errorParam, errorDescription);
      return error(400, `OAuth error: ${errorDescription || errorParam}`);
    }

    // Validate code parameter
    if (!code) {
      console.error('No authorization code received');
      return error(400, 'No authorization code received');
    }

    // Verify state parameter if it was used (CSRF protection)
    const storedState = cookies.get('weeztix_oauth_state');
    if (storedState && state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      return error(400, 'State verification failed');
    }

    // Initialize OAuth service
    const oauth = new WeeztixOAuthService(
      env.WEEZTIX_CLIENT_ID,
      env.WEEZTIX_CLIENT_SECRET,
      env.WEEZTIX_REDIRECT_URI || `${url.origin}/api/weeztix/callback`
    );

    // Exchange code for token
    console.log('Exchanging authorization code for access token...');
    console.log('Code:', code.substring(0, 20) + '...');
    console.log('Redirect URI:', env.WEEZTIX_REDIRECT_URI || `${url.origin}/api/weeztix/callback`);

    const tokenResponse = await oauth.exchangeCodeForToken(code);

    if (!tokenResponse) {
      console.error('Failed to exchange code for token');
      // Log more details for debugging
      console.error('OAuth Config:', {
        clientId: env.WEEZTIX_CLIENT_ID ? 'SET' : 'NOT SET',
        clientSecret: env.WEEZTIX_CLIENT_SECRET ? 'SET' : 'NOT SET',
        redirectUri: env.WEEZTIX_REDIRECT_URI || `${url.origin}/api/weeztix/callback`
      });
      return error(500, 'Failed to obtain access token');
    }

    console.log('Successfully obtained access token');

    // Store token securely (in database for persistence)
    // Note: In production, encrypt the tokens before storing
    const { data: tokenData, error: dbError } = await supabaseAdmin
      .from('weeztix_tokens')
      .upsert({
        id: 'default', // Use a specific ID or user-based ID
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_type: tokenResponse.token_type,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        scope: tokenResponse.scope,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing token:', dbError);
      // Continue even if storage fails - token can still be used
    }

    // Clean up state cookie
    cookies.delete('weeztix_oauth_state', { path: '/' });

    // Register webhook with the obtained token
    if (tokenResponse.access_token) {
      const webhookRegistered = await registerWebhook(tokenResponse.access_token, url.origin);
      if (webhookRegistered) {
        console.log('Webhook successfully registered with Weeztix');
      } else {
        console.warn('Failed to register webhook - manual registration may be required');
      }
    }

    // Redirect to success page or admin dashboard
    return redirect(303, '/admin/settings?weeztix=connected');

  } catch (err) {
    console.error('OAuth callback error:', err);
    return error(500, 'Authentication failed');
  }
};

/**
 * Register webhook with Weeztix API
 */
async function registerWebhook(accessToken: string, origin: string): Promise<boolean> {
  try {
    const webhookUrl = `${origin}/api/weeztix/webhook`;
    const companyGuid = env.WEEZTIX_COMPANY_GUID || env.WEEZTIX_SHOP_GUID;

    console.log('Registering webhook:', webhookUrl);

    // Note: The actual endpoint URL may vary - check Weeztix API documentation
    const response = await fetch('https://api.weeztix.com/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(companyGuid ? { 'Company': companyGuid } : {})
      },
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