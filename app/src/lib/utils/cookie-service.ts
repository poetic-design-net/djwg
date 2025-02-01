export interface CookieSettings {
    necessary: boolean; // Immer true, da technisch notwendig
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
}

export interface CookieInfo {
    name: string;
    purpose: string;
    duration: string;
    type: 'necessary' | 'functional' | 'analytics' | 'marketing';
}

const COOKIE_SETTINGS_KEY = 'cookie-settings';

export const cookieInfo: CookieInfo[] = [
    {
        name: 'session',
        purpose: 'Technisch notwendig für die Authentifizierung',
        duration: 'Sitzung',
        type: 'necessary'
    },
    {
        name: 'supabase-auth',
        purpose: 'Authentifizierung und Benutzerverwaltung',
        duration: '1 Jahr',
        type: 'necessary'
    },
    // Hier weitere Cookies eintragen
];

export const defaultSettings: CookieSettings = {
    necessary: true, // Immer aktiviert
    functional: false,
    analytics: false,
    marketing: false
};

export function saveCookieSettings(settings: CookieSettings): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings));
    }
}

export function loadCookieSettings(): CookieSettings {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(COOKIE_SETTINGS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    }
    return defaultSettings;
}

export function hasAcceptedCookies(): boolean {
    return localStorage.getItem(COOKIE_SETTINGS_KEY) !== null;
}

// Hilfsfunktion zum Setzen von Cookies
export function setCookie(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

// Hilfsfunktion zum Löschen von Cookies
export function deleteCookie(name: string): void {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Funktion zum Anwenden der Cookie-Einstellungen
export function applyCookieSettings(settings: CookieSettings): void {
    // Nicht-notwendige Cookies löschen, wenn sie deaktiviert sind
    if (!settings.functional) {
        // Funktionale Cookies löschen
    }
    if (!settings.analytics) {
        // Analytics Cookies löschen
    }
    if (!settings.marketing) {
        // Marketing Cookies löschen
    }
}