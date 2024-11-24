interface BentoSubscriber {
  email: string;
  firstName?: string;
}

class BentoClient {
  private apiKey: string;
  private siteUuid: string;
  private baseUrl = 'https://api.bentonow.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_BENTO_API_KEY;
    this.siteUuid = import.meta.env.VITE_BENTO_SITE_ID;

    if (!this.apiKey || !this.siteUuid) {
      console.error('Bento configuration missing');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async subscribe(subscriber: BentoSubscriber) {
    try {
      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          site_uuid: this.siteUuid,
          ...subscriber
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bento API error response:', errorText);
        throw new Error(errorText || 'Failed to subscribe');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Bento subscription error:', error);
      throw error;
    }
  }

  async unsubscribe(email: string) {
    try {
      const response = await fetch(`${this.baseUrl}/subscribers/unsubscribe`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          site_uuid: this.siteUuid,
          email
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bento API error response:', errorText);
        throw new Error(errorText || 'Failed to unsubscribe');
      }

      return true;
    } catch (error) {
      console.error('Bento unsubscribe error:', error);
      throw error;
    }
  }

  async getSubscriber(email: string) {
    try {
      const response = await fetch(`${this.baseUrl}/subscribers/find`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          site_uuid: this.siteUuid,
          email
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        console.error('Bento API error response:', errorText);
        throw new Error(errorText || 'Failed to get subscriber');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Bento get subscriber error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bentoClient = new BentoClient();
