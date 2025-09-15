import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * Debug endpoint to check Weeztix configuration
 */
export const GET: RequestHandler = async ({ url }) => {
  const clientId = env.WEEZTIX_CLIENT_ID;
  const redirectUri = env.WEEZTIX_REDIRECT_URI || `${url.origin}/api/weeztix/callback`;

  // Build the authorization URL
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId || 'NOT_SET',
    redirect_uri: redirectUri,
    scope: 'read:orders write:webhooks',
    state: 'test-state-123'
  });

  // Test different possible OAuth URLs
  const possibleUrls = [
    'https://api.weeztix.com/oauth/authorize',
    'https://auth.weeztix.com/oauth/authorize',
    'https://oauth.weeztix.com/authorize',
    'https://www.weeztix.com/oauth/authorize'
  ];

  const authUrl = `${possibleUrls[0]}?${authParams.toString()}`;

  // Try to check which endpoints exist
  const endpointTests: any = {};
  for (const url of possibleUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'DJ Workshop Germany OAuth Client'
        }
      });
      endpointTests[url] = `${response.status} ${response.statusText}`;
    } catch (err: any) {
      endpointTests[url] = `Error: ${err.message}`;
    }
  }

  return json({
    configuration: {
      client_id: clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET',
      client_secret: env.WEEZTIX_CLIENT_SECRET ? 'SET' : 'NOT SET',
      redirect_uri: redirectUri,
      webhook_secret: env.WEEZTIX_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
      badge_id: env.WEEZTIX_TICKET_BADGE_ID || 'NOT SET',
      shop_guid: env.WEEZTIX_SHOP_GUID || 'NOT SET'
    },
    oauth: {
      authorization_url: authUrl,
      endpoint_tests: endpointTests,
      expected_redirect: redirectUri
    },
    troubleshooting: {
      possible_issues: [
        'Client ID/Secret not valid or not activated by Weeztix',
        'Redirect URI not whitelisted in Weeztix OAuth app settings',
        'OAuth app not approved/activated by Weeztix',
        'Wrong OAuth endpoint URLs (check Weeztix documentation)'
      ],
      next_steps: [
        '1. Contact Weeztix to verify OAuth app is active',
        '2. Confirm redirect URI is whitelisted: ' + redirectUri,
        '3. Ask for correct OAuth endpoint URLs',
        '4. Request new Client ID/Secret if compromised'
      ]
    }
  });
};