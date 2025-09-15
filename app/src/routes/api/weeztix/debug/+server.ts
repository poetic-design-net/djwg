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
    'https://oauth.weeztix.com/oauth/authorize',
    'https://www.weeztix.com/oauth/authorize',
    'https://weeztix.com/oauth/authorize',
    'https://api.weeztix.com/v1/oauth/authorize',
    'https://api.weeztix.com/v2/oauth/authorize'
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
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      endpointTests[url] = `${response.status} ${response.statusText}`;
    } catch (err: any) {
      // More detailed error info
      if (err.cause) {
        endpointTests[url] = `Error: ${err.message} - ${err.cause}`;
      } else {
        endpointTests[url] = `Error: ${err.message}`;
      }
    }
  }

  // Also test if oauth.weeztix.com resolves at all
  let oauthDomainCheck = 'unknown';
  try {
    const dnsResponse = await fetch('https://oauth.weeztix.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    oauthDomainCheck = `Domain exists: ${dnsResponse.status}`;
  } catch (err: any) {
    oauthDomainCheck = `Domain issue: ${err.message}`;
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
      oauth_domain_check: oauthDomainCheck,
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