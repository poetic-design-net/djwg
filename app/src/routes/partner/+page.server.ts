import { client } from '$lib/sanity/client';
import { logosQuery } from '$lib/sanity/queries';
import type { Logo } from '$lib/sanity/queries';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load() {
  const logosData = await client.fetch<Logo[]>(logosQuery);

  return {
    logos: {
      data: logosData
    }
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const company = data.get('company');
    const name = data.get('name');
    const email = data.get('email');
    const phone = data.get('phone');
    const message = data.get('message');
    const type = data.get('type');

    // Validate required fields
    if (!company || !name || !email || !message || !type) {
      return fail(400, {
        error: 'Bitte füllen Sie alle erforderlichen Felder aus.'
      });
    }

    try {
      // TODO: Implement email sending or database storage
      // For now, just log the data
      console.log({
        company,
        name,
        email,
        phone,
        message,
        type
      });

      return {
        success: true,
        message: 'Vielen Dank für Ihre Anfrage. Wir werden uns in Kürze bei Ihnen melden.'
      };
    } catch (error) {
      console.error('Error submitting partner form:', error);
      return fail(500, {
        error: 'Es gab einen Fehler beim Senden Ihrer Anfrage. Bitte versuchen Sie es später erneut.'
      });
    }
  }
} satisfies Actions;
