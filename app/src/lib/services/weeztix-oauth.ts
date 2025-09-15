// OAuth credentials will be passed as needed

interface WeeztixTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Weeztix OAuth2 Service for API Access
 * Only needed if you want to make API calls to Weeztix
 * NOT required for webhook-only integration
 */
export class WeeztixOAuthService {
  // Correct OAuth endpoints from Weeztix documentation
  // Weeztix uses openticket.tech domain for OAuth!
  private authorizationUrl = 'https://auth.openticket.tech/tokens/authorize';
  private tokenUrl = 'https://auth.openticket.tech/tokens';
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private baseUrl: string;

  constructor(clientId?: string, clientSecret?: string, redirectUri?: string, baseUrl?: string) {
    this.clientId = clientId || '';
    this.clientSecret = clientSecret || '';
    this.redirectUri = redirectUri || '';
    this.baseUrl = baseUrl || 'https://www.djworkshopgermany.de';
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri || `${this.baseUrl}/api/weeztix/callback`,
      scope: 'read:orders write:webhooks', // Adjust scopes as needed
      state: state || crypto.randomUUID()
    });

    return `${this.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<WeeztixTokenResponse | null> {
    if (!this.clientId || !this.clientSecret) {
      console.error('Weeztix OAuth credentials not configured');
      return null;
    }

    try {
      // According to Weeztix docs, send as JSON body
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri || `${this.baseUrl}/api/weeztix/callback`,
          code
        })
      });

      if (!response.ok) {
        console.error('Failed to exchange code for token:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<WeeztixTokenResponse | null> {
    if (!this.clientId || !this.clientSecret) {
      console.error('Weeztix OAuth credentials not configured');
      return null;
    }

    try {
      // Use JSON body as per Weeztix documentation
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(
    url: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
}