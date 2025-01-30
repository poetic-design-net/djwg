import { client } from '$lib/sanity/client';
import { siteSettingsQuery } from '$lib/sanity/queries/settings';
import type { PageServerLoad, Actions } from './$types';
import type { SiteSettings } from './types';
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
    const message = data.get('message')?.toString();

    // Validierung
    if (!name || !email || !message) {
      return fail(400, {
        error: 'Alle Felder müssen ausgefüllt werden',
        values: { name, email, message }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, {
        error: 'Bitte gib eine gültige E-Mail-Adresse ein',
        values: { name, email, message }
      });
    }

    try {
      const result = await sendEmail({
        name,
        email,
        message,
        formType: 'contact'
      });

      if (!result.success) {
        return fail(500, {
          error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
          values: { name, email, message }
        });
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return fail(500, {
        error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
        values: { name, email, message }
      });
    }
  }
} satisfies Actions;