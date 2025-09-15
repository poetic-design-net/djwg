import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase/admin';
import { weeztixAPI } from '$lib/services/weeztix-api';
import { env } from '$env/dynamic/private';

/**
 * Get Weeztix integration status
 */
export const GET: RequestHandler = async ({ locals }) => {
  try {
    // Check if user is admin (optional - add your auth check here)
    // if (!locals.user?.is_admin) {
    //   return error(403, 'Unauthorized');
    // }

    // Check OAuth token status
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('weeztix_tokens')
      .select('id, expires_at, created_at, updated_at')
      .eq('id', 'default')
      .single();

    const hasToken = !!tokenData && !tokenError;
    const tokenExpired = tokenData?.expires_at
      ? new Date(tokenData.expires_at) < new Date()
      : true;

    // Try to get user info if token exists
    let userInfo = null;
    let webhooks = null;

    if (hasToken && !tokenExpired) {
      userInfo = await weeztixAPI.getUserInfo();
      webhooks = await weeztixAPI.listWebhooks();
    }

    // Get recent orders
    const { data: recentOrders, error: ordersError } = await supabaseAdmin
      .from('weeztix_orders')
      .select('id, order_guid, user_email, badge_assigned, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Check configuration
    const config = {
      clientIdConfigured: !!env.WEEZTIX_CLIENT_ID,
      clientSecretConfigured: !!env.WEEZTIX_CLIENT_SECRET,
      webhookSecretConfigured: !!env.WEEZTIX_WEBHOOK_SECRET,
      badgeIdConfigured: !!env.WEEZTIX_TICKET_BADGE_ID,
      shopGuidConfigured: !!env.WEEZTIX_SHOP_GUID,
      redirectUriConfigured: !!env.WEEZTIX_REDIRECT_URI
    };

    const isFullyConfigured = Object.values(config).every(v => v === true);

    return json({
      status: {
        configured: isFullyConfigured,
        authenticated: hasToken && !tokenExpired,
        tokenExpired,
        lastTokenUpdate: tokenData?.updated_at || null
      },
      config,
      oauth: {
        hasToken,
        tokenExpired,
        tokenCreated: tokenData?.created_at || null,
        tokenExpires: tokenData?.expires_at || null,
        userInfo
      },
      webhooks: {
        registered: webhooks?.length > 0,
        list: webhooks || [],
        expectedUrl: `${env.WEEZTIX_REDIRECT_URI?.replace('/api/weeztix/callback', '')}/api/weeztix/webhook`
      },
      recentOrders: recentOrders || [],
      urls: {
        authorize: '/api/weeztix/authorize',
        webhook: '/api/weeztix/webhook',
        testWebhook: '/api/weeztix/test-webhook'
      }
    });

  } catch (err) {
    console.error('Error getting Weeztix status:', err);
    return error(500, 'Failed to get status');
  }
};