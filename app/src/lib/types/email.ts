export type EmailTemplate = 'artist-application' | 'exhibitor-request' | 'manufacturer-request';

export interface EmailConfig {
  recipient: string;
  subject: string;
  defaultBody: string;
  template: EmailTemplate;
}

export interface EmailData {
  // Gemeinsame Felder
  type: 'artist' | 'aussteller' | 'hersteller';
  name: string;
  email: string;
  phone?: string;
  message: string;
  
  // Artist-spezifische Daten
  experience?: string;
  instagram?: string;
  soundcloud?: string;
  
  // Aussteller/Hersteller-spezifische Daten
  website?: string;
  company?: string;
  industry?: string;
  products?: string;
  
  // Hersteller-spezifische Daten
  package?: string;
  addOns?: string[];
  accommodation?: {
    needed: boolean;
    persons?: number;
    roomType?: string;
  };
}

// E-Mail-Optionen für den Service
export interface EmailServiceOptions {
  template: EmailTemplate;
  data: EmailData;
}

// Template-Konfigurationen für verschiedene E-Mail-Typen
export const emailConfigs: Record<EmailTemplate, EmailConfig> = {
  'artist-application': {
    recipient: 'artists@example.com',
    subject: '[DJ Workshop] Neue Artist-Bewerbung',
    defaultBody: 'Eine neue Artist-Bewerbung ist eingegangen.',
    template: 'artist-application'
  },
  'exhibitor-request': {
    recipient: 'exhibitors@example.com',
    subject: '[DJ Workshop] Neue Aussteller-Anfrage',
    defaultBody: 'Eine neue Aussteller-Anfrage ist eingegangen.',
    template: 'exhibitor-request'
  },
  'manufacturer-request': {
    recipient: 'manufacturers@example.com',
    subject: '[DJ Workshop] Neue Hersteller-Anfrage',
    defaultBody: 'Eine neue Hersteller-Anfrage ist eingegangen.',
    template: 'manufacturer-request'
  }
};

/**
 * Generiert den E-Mail-Body basierend auf den Daten
 */
export function generateEmailBody(data: EmailData): string {
  let body = `Neue Anfrage von ${data.name} (${data.email})`;
  if (data.phone) body += `\nTelefon: ${data.phone}`;
  body += `\n\nNachricht:\n${data.message}\n\n`;

  switch (data.type) {
    case 'artist':
      body += `Erfahrung: ${data.experience}\n`;
      if (data.instagram) body += `Instagram: ${data.instagram}\n`;
      if (data.soundcloud) body += `SoundCloud: ${data.soundcloud}\n`;
      break;

    case 'aussteller':
    case 'hersteller':
      if (data.website) body += `Website: ${data.website}\n`;
      if (data.company) body += `Firma: ${data.company}\n`;
      if (data.industry) body += `Branche: ${data.industry}\n`;
      if (data.products) body += `Produkte: ${data.products}\n`;

      if (data.type === 'hersteller') {
        if (data.package) body += `Ausgewähltes Paket: ${data.package}\n`;
        if (data.addOns?.length) body += `Add-Ons: ${data.addOns.join(', ')}\n`;
        if (data.accommodation?.needed) {
          body += `\nÜbernachtung gewünscht:\n`;
          body += `Personen: ${data.accommodation.persons}\n`;
          body += `Zimmertyp: ${data.accommodation.roomType}\n`;
        }
      }
      break;
  }

  return body;
}