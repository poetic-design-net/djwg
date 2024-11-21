import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const phone = data.get('phone');
    const message = data.get('message');
    const instagram = data.get('instagram');
    const soundcloud = data.get('soundcloud');
    const experience = data.get('experience');

    // Validate required fields
    if (!name || !email || !message || !experience) {
      return fail(400, {
        error: 'Bitte füllen Sie alle erforderlichen Felder aus.'
      });
    }

    try {
      // TODO: Implement email sending or database storage
      // For now, just log the data
      console.log({
        name,
        email,
        phone,
        message,
        instagram,
        soundcloud,
        experience
      });

      return {
        success: true,
        message: 'Vielen Dank für deine Bewerbung. Wir werden uns in Kürze bei dir melden.'
      };
    } catch (error) {
      console.error('Error submitting artist form:', error);
      return fail(500, {
        error: 'Es gab einen Fehler beim Senden deiner Bewerbung. Bitte versuche es später erneut.'
      });
    }
  }
} satisfies Actions;
