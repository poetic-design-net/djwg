import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getAvailabilities, addAvailability, deleteAvailability } from '$lib/services/dj-holiday';
import type { Database } from '$lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export const GET = async (event: RequestEvent) => {
  const supabase = event.locals.supabase as SupabaseClient<Database>;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const userId = session.user.id;
  
  try {
    const { data, error } = await getAvailabilities(userId);
    
    if (error) {
      console.error('Fehler beim Abrufen der Verfügbarkeiten:', error);
      return json({ error: 'Fehler beim Abrufen der Verfügbarkeiten' }, { status: 500 });
    }
    
    return json({ data });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return json({ error: 'Ein interner Serverfehler ist aufgetreten' }, { status: 500 });
  }
};

export const POST = async (event: RequestEvent) => {
  const supabase = event.locals.supabase as SupabaseClient<Database>;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  try {
    const { startDate, endDate, status } = await event.request.json();

    if (!startDate || !endDate || !status) {
      return json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    const { data, error } = await addAvailability(
      session.user.id,
      new Date(startDate),
      new Date(endDate),
      status
    );

    if (error) {
      console.error('Fehler beim Hinzufügen der Verfügbarkeit:', error);
      return json({ error: 'Fehler beim Hinzufügen der Verfügbarkeit' }, { status: 500 });
    }

    return json({ data });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return json({ error: 'Ein interner Serverfehler ist aufgetreten' }, { status: 500 });
  }
};

export const DELETE = async (event: RequestEvent) => {
  const supabase = event.locals.supabase as SupabaseClient<Database>;
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const id = event.url.searchParams.get('id');
  
  if (!id) {
    return json({ error: 'Keine ID angegeben' }, { status: 400 });
  }

  try {
    const { error } = await deleteAvailability(id);
    
    if (error) {
      console.error('Fehler beim Löschen der Verfügbarkeit:', error);
      return json({ error: 'Fehler beim Löschen der Verfügbarkeit' }, { status: 500 });
    }
    
    return json({ success: true });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return json({ error: 'Ein interner Serverfehler ist aufgetreten' }, { status: 500 });
  }
};