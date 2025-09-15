import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { WeeztixOAuthService } from '$lib/services/weeztix-oauth';
import crypto from 'crypto';

/**
 * Initiate OAuth2 authorization flow with Weeztix
 * Redirects user to Weeztix authorization page
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID();

  // Store state in cookie for verification in callback
  cookies.set('weeztix_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  });

  // Initialize OAuth service
  const oauth = new WeeztixOAuthService(
    env.WEEZTIX_CLIENT_ID,
    env.WEEZTIX_CLIENT_SECRET,
    env.WEEZTIX_REDIRECT_URI || `${url.origin}/api/weeztix/callback`
  );

  // Generate authorization URL
  const authUrl = oauth.getAuthorizationUrl(state);

  console.log('Redirecting to Weeztix authorization:', authUrl);

  // Redirect to Weeztix authorization page
  return redirect(303, authUrl);
};