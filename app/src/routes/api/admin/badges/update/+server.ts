import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/supabase/admin';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Prüfe Admin-Berechtigung
    const session = await locals.supabase.auth.getSession();
    
    if (!session.data.session?.user) {
      return json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { data: profile } = await locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', session.data.session.user.id)
      .single();

    if (!profile?.role || profile.role !== 'admin') {
      return json({ error: 'Keine Admin-Berechtigung' }, { status: 403 });
    }

    // Parse Request Body
    const { id, name, description, slug } = await request.json();

    if (!id || !name) {
      return json({ error: 'ID und Name sind erforderlich' }, { status: 400 });
    }

    // Update Badge in Supabase
    const { data, error } = await supabaseAdmin
      .from('badges')
      .update({
        name,
        description: description || null,
        slug: slug || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Update des Badges:', error);
      return json({ error: 'Fehler beim Speichern des Badges' }, { status: 500 });
    }

    return json({ success: true, badge: data });

  } catch (error) {
    console.error('Fehler in Badge Update API:', error);
    return json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
};
