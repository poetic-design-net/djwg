import { client } from '$lib/sanity/client';
import { siteSettingsQuery } from '$lib/sanity/queries/settings';
import type { PageServerLoad, Actions } from './$types';
import type { SiteSettings } from '../contact/types';
import { sendEmail } from '$lib/server/email';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const settings = await client.fetch<SiteSettings>(siteSettingsQuery);

  return {
    settings
  };
};

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString();
    const email = data.get('email')?.toString();
    const phone = data.get('phone')?.toString();
    const website = data.get('website')?.toString();
    const company = data.get('company')?.toString();
    const industry = data.get('industry')?.toString();
    const products = data.get('products')?.toString();
    const message = data.get('message')?.toString();

    // Validierung
    if (!name || !email || !message) {
      return fail(400, {
        error: 'Name, E-Mail und Nachricht sind erforderlich',
        values: { name, email, phone, website, company, industry, products, message }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, {
        error: 'Bitte gib eine gültige E-Mail-Adresse ein',
        values: { name, email, phone, website, company, industry, products, message }
      });
    }

    try {
      // Erstelle eine formatierte Nachricht mit allen Informationen
      const formattedMessage = `
Partneranfrage von ${name}

Kontaktinformationen:
- Name/Firma: ${name}
- E-Mail: ${email}
- Telefon: ${phone || 'Nicht angegeben'}
- Website: ${website || 'Nicht angegeben'}

Unternehmensinformationen:
- Firma: ${company || 'Nicht angegeben'}
- Branche: ${industry || 'Nicht angegeben'}

Produkte/Services:
${products || 'Nicht angegeben'}

Zusätzliche Informationen:
${message}
      `.trim();

      const result = await sendEmail({
        name,
        email,
        message: formattedMessage,
        formType: 'partner',
        subject: 'Neue Partner-Anfrage'
      });

      if (!result.success) {
        return fail(500, {
          error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
          values: { name, email, phone, website, company, industry, products, message }
        });
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return fail(500, {
        error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
        values: { name, email, phone, website, company, industry, products, message }
      });
    }
  }
} satisfies Actions;
