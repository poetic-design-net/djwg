import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

// Initialize the store with the saved value from localStorage, if available
const initialValue = browser ? localStorage.getItem(COOKIE_CONSENT_KEY) === 'true' : false;

const cookieConsent = writable<boolean>(initialValue);

// Subscribe to changes and update localStorage
if (browser) {
    cookieConsent.subscribe((value) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, value.toString());
    });
}

export { cookieConsent };