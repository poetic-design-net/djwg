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

    console.log('Processing contact form:', { name, email }); // Debug log

    // Validierung
    if (!name || !email || !message) {
      console.log('Validation failed: Missing fields');
      return fail(400, {
        error: 'Alle Felder müssen ausgefüllt werden',
        values: { name, email, message }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Validation failed: Invalid email');
      return fail(400, {
        error: 'Bitte gib eine gültige E-Mail-Adresse ein',
        values: { name, email, message }
      });
    }

    try {
      console.log('Attempting to send email...');
      const result = await sendEmail({
        name,
        email,
        message,
        formType: 'contact'
      });

      console.log('Email result:', result);

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
      console.error('Error in form submission:', error);
      return fail(500, {
        error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
        values: { name, email, message }
      });
    }
  }
} satisfies Actions;