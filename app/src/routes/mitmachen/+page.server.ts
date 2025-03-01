import { client } from '$lib/sanity/client';
import { artistPageQuery } from '$lib/sanity/queries/artist-partner';
import { partnerPageQuery } from '$lib/sanity/queries/artist-partner';
import { sendServiceEmail } from '$lib/services/email.service';
import type { EmailData } from '$lib/types/email';
import {
  type FormResult,
  getFormValue,
  getFormArrayValue
} from './types';
import type { PageServerLoad } from './$types';

/**
 * Lädt die erforderlichen Daten aus Sanity für die Mitmachen-Seite
 */
export const load: PageServerLoad = async () => {
  const [artistPage, partnerPage, settings] = await Promise.all([
    client.fetch(artistPageQuery),
    client.fetch(partnerPageQuery),
    client.fetch(`*[_type == "siteSettings"][0]`)
  ]);

  // Wir erstellen ein kombiniertes Objekt für die Mitmachen-Seite
  const participatePage = {
    // Grundlegende Informationen
    title: 'Mitmachen',
    description: 'Werde Teil unseres DJ Workshops als Artist, Aussteller oder Hersteller!',
    
    // Künstler-spezifische Informationen
    artist: {
      title: artistPage?.title || 'Werde Teil unseres Teams',
      description: artistPage?.description || 'Teile deine Leidenschaft für Musik und inspiriere die nächste Generation von DJs',
      benefits: artistPage?.benefits || [
        {
          title: 'Wertvolle Erfahrung',
          description: 'Entwickle dich als Trainer weiter und sammle wertvolle Erfahrungen in der Vermittlung deines Wissens.'
        },
        {
          title: 'Netzwerk',
          description: 'Werde Teil eines starken Netzwerks aus DJs, Produzenten und Veranstaltern. Profitiere von unserem Know-how.'
        },
        {
          title: 'Flexibilität',
          description: 'Gestalte deine Workshops nach deinen Vorstellungen und bring deine eigenen Ideen ein.'
        },
        {
          title: 'Vergütung',
          description: 'Faire Vergütung für dein Engagement und deine Zeit. Profitiere von verschiedenen Verdienstmöglichkeiten.'
        }
      ],
      experienceLevels: artistPage?.experienceLevels || [
        { value: 'beginner', label: '1-2 Jahre' },
        { value: 'intermediate', label: '3-5 Jahre' },
        { value: 'advanced', label: '5+ Jahre' },
        { value: 'professional', label: 'Professioneller DJ' }
      ],
      formSettings: artistPage?.formSettings
    },
    
    // Partner-spezifische Informationen
    partner: {
      title: partnerPage?.title || 'Partner werden',
      description: partnerPage?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!',
      benefits: partnerPage?.benefits || [
        {
          title: 'Direkte Zielgruppe',
          description: 'Erreiche motivierte DJs und Musikbegeisterte direkt vor Ort.'
        },
        {
          title: 'Präsentation',
          description: 'Eigener Stand und Präsentationsmöglichkeiten für deine Produkte.'
        },
        {
          title: 'Networking',
          description: 'Knüpfe wertvolle Kontakte in der DJ- und Musikbranche.'
        }
      ],
      exhibitorInfo: partnerPage?.exhibitorInfo,
      marketingInfo: partnerPage?.marketingInfo
    },
    
    // Hersteller-spezifische Informationen
    manufacturer: {
      title: 'Hersteller werden',
      description: 'Präsentiere deine Produkte auf unserem Event mit verschiedenen Sponsoring-Optionen.',
      benefits: [
        {
          title: 'Verschiedene Optionen',
          description: 'Verschiedene Sponsoring-Optionen für unterschiedliche Budgets'
        },
        {
          title: 'Markenplatzierung',
          description: 'Prominente Markenplatzierung in verschiedenen Bereichen'
        },
        {
          title: 'Werbung',
          description: 'Social Media und Homepage Werbung für maximale Reichweite'
        },
        {
          title: 'Community',
          description: 'Direkter Kontakt zur DJ-Community und potenziellen Kunden'
        }
      ],
      packages: [
        {
          id: 'sponsor',
          title: 'Sponsor / Supporter',
          price: '380€ inkl. MwSt',
          features: [
            'Social Media Advertising Basic',
            'Homepage Advertising',
            'Merchandise Advertising'
          ]
        },
        {
          id: 'exhibitor',
          title: 'Exhibitor',
          price: '700€ inkl. MwSt',
          features: [
            '2 Days',
            'Stand space of 5 qm',
            '3 Exhibitor Tickets',
            '2 Free Tickets Giveaway',
            'Social Media Advertising Basic',
            'Homepage Advertising',
            'Merchandise Advertising'
          ]
        },
        {
          id: 'area-branding',
          title: 'Area Branding (Exklusiv)',
          price: '5000€ inkl. MwSt',
          features: [
            'Area Branding (Mixing Area by…, PA Area by…, Light Area by…)',
            '2 Days',
            'Stand space of 7 qm',
            '5 Exhibitor Tickets',
            '2 Free Tickets Giveaway',
            'Social Media Advertising Premium',
            'Homepage Advertising',
            'Merchandise Advertising',
            'Video Content Advertising'
          ]
        }
      ],
      addOns: [
        {
          id: 'extra-space',
          title: 'Extra stand space (1 qm)',
          price: '140€ inkl. MwSt',
          availableFor: ['exhibitor', 'area-branding']
        },
        {
          id: 'social-push',
          title: 'Social Media Promotion Push',
          price: '240€ inkl. MwSt',
          availableFor: ['exhibitor', 'area-branding']
        },
        {
          id: 'extra-ticket',
          title: 'Extra Exhibitor Ticket (max. 3)',
          price: '50€ inkl. MwSt (pro Ticket)',
          availableFor: ['exhibitor', 'area-branding']
        },
        {
          id: 'video-content',
          title: 'Extra Video Content Advertising',
          price: '380€ inkl. MwSt',
          availableFor: ['exhibitor', 'area-branding']
        }
      ]
    }
  };

  return {
    participatePage,
    settings
  };
};

/**
 * Verarbeitet die Formularübermittlung unterschiedlicher Benutzertypen
 */
export const actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData();
      const type = getFormValue(formData, 'type');
      
      // Gemeinsame Felder
      const name = getFormValue(formData, 'name');
      const email = getFormValue(formData, 'email');
      const message = getFormValue(formData, 'message');
      
      // Validierung der Pflichtfelder
      if (!name || !email || !message || !type) {
        return {
          error: 'Bitte fülle alle erforderlichen Felder aus.',
          values: Object.fromEntries(formData)
        };
      }

      // E-Mail-Validierung
      if (!isValidEmail(email)) {
        return {
          error: 'Bitte gib eine gültige E-Mail-Adresse ein.',
          values: Object.fromEntries(formData)
        };
      }

      // Typ-spezifische Verarbeitung
      switch(type) {
        case 'artist':
          return handleArtistSubmission(formData);
        case 'aussteller':
          return handlePartnerSubmission(formData);
        case 'hersteller':
          return handleManufacturerSubmission(formData);
        default:
          return {
            error: 'Ungültiger Anfragetyp.',
            values: Object.fromEntries(formData)
          };
      }
    } catch (error) {
      console.error('Form submission error:', error);
      return {
        error: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      };
    }
  }
};

/**
 * Verarbeitet die Künstler-Bewerbung
 */
async function handleArtistSubmission(formData: FormData): Promise<FormResult> {
  const experience = getFormValue(formData, 'experience');
  const instagram = getFormValue(formData, 'instagram');
  const soundcloud = getFormValue(formData, 'soundcloud');
  
  if (!experience) {
    return {
      error: 'Bitte gib deine DJ-Erfahrung an.',
      values: Object.fromEntries(formData)
    };
  }
  
  const emailData: EmailData = {
    type: 'artist',
    name: getFormValue(formData, 'name'),
    email: getFormValue(formData, 'email'),
    phone: getFormValue(formData, 'phone'),
    message: getFormValue(formData, 'message'),
    experience,
    instagram,
    soundcloud
  };

  try {
    await sendServiceEmail({
      template: 'artist-application',
      data: emailData
    });

    return {
      success: true,
      message: 'Vielen Dank für deine Bewerbung! Wir melden uns in Kürze bei dir.'
    };
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand (Artist):', error);
    return {
      error: 'Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage. Bitte versuche es später erneut.',
      values: Object.fromEntries(formData)
    };
  }
}

/**
 * Verarbeitet die Aussteller-Anfrage
 */
async function handlePartnerSubmission(formData: FormData): Promise<FormResult> {
  const website = getFormValue(formData, 'website');
  const company = getFormValue(formData, 'company');
  const industry = getFormValue(formData, 'industry');
  const products = getFormValue(formData, 'products');

  if (!company || !industry) {
    return {
      error: 'Bitte fülle alle erforderlichen Felder aus.',
      values: Object.fromEntries(formData)
    };
  }

  const emailData: EmailData = {
    type: 'aussteller',
    name: getFormValue(formData, 'name'),
    email: getFormValue(formData, 'email'),
    phone: getFormValue(formData, 'phone'),
    message: getFormValue(formData, 'message'),
    website,
    company,
    industry,
    products
  };

  try {
    await sendServiceEmail({
      template: 'exhibitor-request',
      data: emailData
    });

    return {
      success: true,
      message: 'Vielen Dank für deine Anfrage! Wir melden uns in Kürze bei dir.'
    };
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand (Aussteller):', error);
    return {
      error: 'Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage. Bitte versuche es später erneut.',
      values: Object.fromEntries(formData)
    };
  }
}

/**
 * Verarbeitet die Hersteller-Anfrage
 */
async function handleManufacturerSubmission(formData: FormData): Promise<FormResult> {
  const website = getFormValue(formData, 'website');
  const company = getFormValue(formData, 'company');
  const industry = getFormValue(formData, 'industry');
  const products = getFormValue(formData, 'products');
  const packageType = getFormValue(formData, 'package');

  if (!packageType || !company) {
    return {
      error: 'Bitte fülle alle erforderlichen Felder aus.',
      values: Object.fromEntries(formData)
    };
  }

  const emailData: EmailData = {
    type: 'hersteller',
    name: getFormValue(formData, 'name'),
    email: getFormValue(formData, 'email'),
    phone: getFormValue(formData, 'phone'),
    message: getFormValue(formData, 'message'),
    website,
    company,
    industry,
    products,
    package: packageType,
    addOns: getFormArrayValue(formData, 'addOns'),
    accommodation: {
      needed: getFormValue(formData, 'accommodation_needed') === 'true',
      persons: Number(getFormValue(formData, 'accommodation_persons')),
      roomType: getFormValue(formData, 'accommodation_roomType')
    }
  };

  try {
    await sendServiceEmail({
      template: 'manufacturer-request',
      data: emailData
    });

    return {
      success: true,
      message: 'Vielen Dank für deine Anfrage! Wir melden uns in Kürze mit weiteren Informationen bei dir.'
    };
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand (Hersteller):', error);
    return {
      error: 'Entschuldigung, es gab ein Problem bei der Verarbeitung deiner Anfrage. Bitte versuche es später erneut.',
      values: Object.fromEntries(formData)
    };
  }
}

/**
 * Überprüft die Gültigkeit einer E-Mail-Adresse
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}