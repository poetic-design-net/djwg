import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { weeztixAPI } from '$lib/services/weeztix-api';
import { env } from '$env/dynamic/private';

/**
 * Register webhook with Weeztix
 */
export const POST: RequestHandler = async ({ url }) => {
  try {
    const webhookUrl = env.WEEZTIX_WEBHOOK_URL || `${url.origin.replace('localhost:5173', 'www.djworkshopgermany.de')}/api/weeztix/webhook`;

    console.log('Attempting to register webhook:', webhookUrl);

    // Try to register webhook
    const success = await weeztixAPI.registerWebhook(webhookUrl);

    if (!success) {
      // If the specialized method fails, try a direct approach
      console.log('Trying alternative webhook registration...');

      // Get valid token from our stored tokens
      const response = await weeztixAPI.request('/webhooks', {
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

      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'No response';
        console.error('Webhook registration failed:', errorText);

        return json({
          success: false,
          error: 'Failed to register webhook',
          details: errorText,
          attempted_url: webhookUrl,
          note: 'You may need to register the webhook manually with Weeztix'
        }, { status: 400 });
      }

      const result = await response.json();
      console.log('Webhook registered:', result);

      return json({
        success: true,
        webhook: result,
        url: webhookUrl
      });
    }

    return json({
      success: true,
      message: 'Webhook registered successfully',
      url: webhookUrl
    });

  } catch (err: any) {
    console.error('Webhook registration error:', err);
    return error(500, err.message || 'Failed to register webhook');
  }
};

/**
 * GET endpoint to check current webhooks
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const webhooks = await weeztixAPI.listWebhooks();
    const expectedUrl = env.WEEZTIX_WEBHOOK_URL || `${url.origin.replace('localhost:5173', 'www.djworkshopgermany.de')}/api/weeztix/webhook`;

    return json({
      registered: webhooks && webhooks.length > 0,
      webhooks: webhooks || [],
      expected_url: expectedUrl,
      instructions: {
        manual_registration: 'If automatic registration fails, please contact Weeztix to register this webhook URL manually',
        webhook_url: expectedUrl,
        events_needed: ['order.completed', 'order.paid', 'order.created', 'ticket.validated']
      }
    });

  } catch (err: any) {
    console.error('Error listing webhooks:', err);
    return error(500, 'Failed to list webhooks');
  }
};