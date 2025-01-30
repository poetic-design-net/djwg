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
    const instagram = data.get('instagram')?.toString();
    const soundcloud = data.get('soundcloud')?.toString();
    const experience = data.get('experience')?.toString();
    const message = data.get('message')?.toString();

    // Validierung
    if (!name || !email || !message) {
      return fail(400, {
        error: 'Name, E-Mail und Nachricht sind erforderlich',
        values: { name, email, phone, instagram, soundcloud, experience, message }
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, {
        error: 'Bitte gib eine gültige E-Mail-Adresse ein',
        values: { name, email, phone, instagram, soundcloud, experience, message }
      });
    }

    try {
      // Erstelle eine formatierte Nachricht mit allen Informationen
      const formattedMessage = `
Artist-Bewerbung von ${name}

Kontaktinformationen:
- Name: ${name}
- E-Mail: ${email}
- Telefon: ${phone || 'Nicht angegeben'}

DJ-Profil:
- Erfahrung: ${experience}
- Instagram: ${instagram ? `@${instagram}` : 'Nicht angegeben'}
- SoundCloud: ${soundcloud || 'Nicht angegeben'}

Nachricht:
${message}
      `.trim();

      const result = await sendEmail({
        name,
        email,
        message: formattedMessage,
        formType: 'artist',
        subject: 'Neue Artist-Bewerbung'
      });

      if (!result.success) {
        return fail(500, {
          error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
          values: { name, email, phone, instagram, soundcloud, experience, message }
        });
      }

      return {
        success: true,
        message: 'Vielen Dank für deine Bewerbung! Wir melden uns in Kürze bei dir.'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return fail(500, {
        error: 'Es ist ein Fehler beim Senden der E-Mail aufgetreten',
        values: { name, email, phone, instagram, soundcloud, experience, message }
      });
    }
  }
} satisfies Actions;
