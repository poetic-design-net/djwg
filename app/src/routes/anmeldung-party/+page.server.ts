import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase } = locals;

  const { data } = await supabase
    .from('party_registrations')
    .select('person_count');

  const totalPersons = data?.reduce((sum, reg) => sum + (reg.person_count || 1), 0) || 0;

  return {
    registrationCount: totalPersons
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    const { supabase } = locals;
    const formData = await request.formData();

    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const personCount = parseInt(formData.get('personCount')?.toString() || '1');

    if (!name || !email) {
      return fail(400, {
        error: 'Name und Email sind erforderlich'
      });
    }

    if (isNaN(personCount) || personCount < 1 || personCount > 10) {
      return fail(400, {
        error: 'Ungültige Anzahl von Personen (1-10 erlaubt)'
      });
    }

    const { error } = await supabase
      .from('party_registrations')
      .insert([{ name, email, person_count: personCount }]);

    if (error) {
      console.error('Registration error:', error);
      return fail(500, {
        error: 'Es gab einen Fehler bei der Anmeldung'
      });
    }

    return { success: true };
  }
} satisfies Actions;