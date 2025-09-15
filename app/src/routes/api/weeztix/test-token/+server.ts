import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

/**
 * Test token exchange directly without OAuth flow
 * Use the authorization code from the URL after successful OAuth
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return json({ error: 'No authorization code provided' }, { status: 400 });
    }

    console.log('Testing token exchange with code:', code.substring(0, 20) + '...');

    // Direct token exchange request
    const tokenUrl = 'https://auth.openticket.tech/tokens';
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: env.WEEZTIX_CLIENT_ID,
      client_secret: env.WEEZTIX_CLIENT_SECRET,
      redirect_uri: env.WEEZTIX_REDIRECT_URI || 'https://www.djworkshopgermany.de/api/weeztix/callback',
      code
    };

    console.log('Token request:', {
      url: tokenUrl,
      body: {
        ...requestBody,
        client_secret: 'HIDDEN',
        code: code.substring(0, 20) + '...'
      }
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();

    if (!response.ok) {
      return json({
        error: 'Token exchange failed',
        status: response.status,
        statusText: response.statusText,
        response: responseText,
        request: {
          grant_type: 'authorization_code',
          client_id: env.WEEZTIX_CLIENT_ID ? 'SET' : 'NOT SET',
          client_secret: env.WEEZTIX_CLIENT_SECRET ? 'SET' : 'NOT SET',
          redirect_uri: requestBody.redirect_uri
        }
      }, { status: 400 });
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      return json({
        error: 'Invalid JSON response',
        response: responseText
      }, { status: 500 });
    }

    return json({
      success: true,
      token: tokenData,
      info: {
        access_token: tokenData.access_token ? 'RECEIVED' : 'NOT RECEIVED',
        refresh_token: tokenData.refresh_token ? 'RECEIVED' : 'NOT RECEIVED',
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      }
    });

  } catch (error: any) {
    return json({
      error: 'Test failed',
      message: error.message
    }, { status: 500 });
  }
};

/**
 * GET endpoint shows instructions
 */
export const GET: RequestHandler = async () => {
  return json({
    message: 'Token Exchange Test Endpoint',
    instructions: {
      step1: 'Go to https://www.djworkshopgermany.de/admin/weeztix',
      step2: 'Click "Connect with Weeztix" and authorize',
      step3: 'When you get the 500 error, copy the "code" parameter from the URL',
      step4: 'POST to this endpoint with { "code": "YOUR_CODE_HERE" }',
      step5: 'This will show you the exact error from the token exchange'
    },
    example: {
      method: 'POST',
      body: {
        code: 'def502002...(the long code from the URL)'
      }
    }
  });
};