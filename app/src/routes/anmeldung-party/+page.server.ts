import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase } = locals;

  const { count } = await supabase
    .from('party_registrations')
    .select('*', { count: 'exact', head: true });

  return {
    registrationCount: count
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const { supabase } = locals;
    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();

    if (!name || !email) {
      return fail(400, {
        error: 'Name und Email sind erforderlich'
      });
    }

    const { error } = await supabase
      .from('party_registrations')
      .insert([{ name, email }]);

    if (error) {
      console.error('Registration error:', error);
      return fail(500, {
        error: 'Es gab einen Fehler bei der Anmeldung'
      });
    }

    return { success: true };
  }
} satisfies Actions;