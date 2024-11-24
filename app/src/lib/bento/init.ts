declare global {
  interface Window {
    Bento?: any;
  }
}

export const initBento = () => {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Prevent multiple initializations
  if (window.Bento) return;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBentoScript);
  } else {
    initBentoScript();
  }
};

function initBentoScript() {
  const site_uuid = import.meta.env.VITE_BENTO_SITE_ID;
  
  // Skip if no site UUID
  if (!site_uuid) {
    console.error('Bento site UUID not found');
    return;
  }

  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://app.bentonow.com/9c5a371da042891eb6c8b52cdd6da85a.js';
  script.id = 'bento-sdk';
  script.setAttribute('data-site-uuid', site_uuid);

  // Find head element
  const head = document.getElementsByTagName('head')[0];
  if (!head) {
    console.error('Could not find head element');
    return;
  }

  // Append script to head
  head.appendChild(script);
}

// Helper to identify users
export const identifyBentoUser = (email: string, firstName?: string) => {
  if (typeof window === 'undefined' || !window.Bento) return;

  window.Bento.identify(email, {
    email,
    ...(firstName && { firstName })
  });
};

// Helper to track events
export const trackBentoEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.Bento) return;

  window.Bento.track(eventName, properties);
};

// Helper to subscribe to newsletter
export const subscribeToNewsletter = (email: string, firstName?: string) => {
  if (typeof window === 'undefined' || !window.Bento) return;

  window.Bento.subscribe(email, {
    email,
    ...(firstName && { firstName })
  });
};

// Helper to unsubscribe from newsletter
export const unsubscribeFromNewsletter = (email: string) => {
  if (typeof window === 'undefined' || !window.Bento) return;

  window.Bento.unsubscribe(email);
};
