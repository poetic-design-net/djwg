import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import crypto from 'crypto';

/**
 * Test endpoint for simulating Weeztix webhook calls
 * Only available in development mode for security
 */
export const POST: RequestHandler = async ({ request, url }) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return error(403, 'Test endpoint not available in production');
  }

  try {
    const body = await request.json();

    // Generate a test order payload
    const testPayload = {
      orderGuid: body.orderGuid || `test-order-${Date.now()}`,
      email: body.email || 'test@example.com',
      firstname: body.firstname || 'Test',
      lastname: body.lastname || 'User',
      ticketGuid: body.ticketGuid || `test-ticket-${Date.now()}`,
      reservationGuid: body.reservationGuid || `test-reservation-${Date.now()}`,
      eventDateGuid: body.eventDateGuid || `test-event-${Date.now()}`,
      productGuid: body.productGuid || `test-product-${Date.now()}`,
      status: body.status || 'completed',
      timestamp: body.timestamp || new Date().toISOString()
    };

    // Create the webhook URL
    const baseUrl = url.origin;
    const webhookUrl = `${baseUrl}/api/weeztix/webhook`;

    // Generate signature if secret is configured
    let headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (env.WEEZTIX_WEBHOOK_SECRET) {
      const signature = crypto
        .createHmac('sha256', env.WEEZTIX_WEBHOOK_SECRET || '')
        .update(JSON.stringify(testPayload))
        .digest('hex');

      headers['x-weeztix-signature'] = signature;
    }

    // Call the actual webhook endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();

    return json({
      success: response.ok,
      status: response.status,
      testPayload,
      webhookResponse: result,
      badgeId: env.WEEZTIX_TICKET_BADGE_ID || 'Not configured',
      note: 'Test webhook sent successfully'
    });

  } catch (err) {
    console.error('Test webhook error:', err);
    return error(500, 'Failed to send test webhook');
  }
};

/**
 * GET endpoint to show test webhook information
 */
export const GET: RequestHandler = async ({ url }) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return error(403, 'Test endpoint not available in production');
  }

  const examplePayload = {
    orderGuid: 'test-order-123',
    email: 'user@example.com',
    firstname: 'John',
    lastname: 'Doe',
    ticketGuid: 'test-ticket-456',
    reservationGuid: 'test-reservation-789',
    eventDateGuid: 'test-event-date-abc',
    productGuid: 'test-product-def',
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  return json({
    message: 'Weeztix Test Webhook Endpoint',
    description: 'Use POST request to simulate a Weeztix webhook',
    webhookUrl: `${url.origin}/api/weeztix/webhook`,
    badgeConfigured: !!env.WEEZTIX_TICKET_BADGE_ID,
    badgeId: env.WEEZTIX_TICKET_BADGE_ID || 'Not configured',
    secretConfigured: !!env.WEEZTIX_WEBHOOK_SECRET,
    examplePayload,
    usage: {
      method: 'POST',
      endpoint: '/api/weeztix/test-webhook',
      body: 'JSON payload with order details (see examplePayload)',
      note: 'Only available in development mode'
    }
  });
};