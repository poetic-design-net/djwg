import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  try {
    const code = event.url.searchParams.get('code');
    const next = event.url.searchParams.get('next') ?? '/';

    if (!code) {
      console.error('No code provided in callback');
      throw redirect(303, '/auth?error=no_code');
    }

    if (!event.locals.supabase) {
      console.error('No Supabase client available');
      throw redirect(303, '/auth?error=no_client');
    }

    // Exchange the code for a session
    const { error: exchangeError } = await event.locals.supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      throw redirect(303, `/auth?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`);
    }

    // Get the session after exchange
    const { data: { session }, error: sessionError } = await event.locals.supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Error getting session:', sessionError);
      throw redirect(303, '/auth?error=session_error');
    }

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await event.locals.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user after exchange:', userError);
      throw redirect(303, '/auth?error=user_error');
    }

    if (user.aud !== 'authenticated') {
      console.error('User not properly authenticated');
      throw redirect(303, '/auth?error=not_authenticated');
    }

    // Wenn es eine OAuth-Anmeldung war (z.B. Google), Profil aktualisieren
    if (user.app_metadata.provider === 'google') {
      const { data: existingProfile } = await event.locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Extrahiere die Profildaten aus den Google-Metadaten
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

      if (!existingProfile) {
        // Erstelle ein neues Profil
        const [firstName = '', lastName = ''] = fullName.split(' ');
        await event.locals.supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, ''),
            is_public: false
          });
      } else {
        // Aktualisiere bestehendes Profil
        await event.locals.supabase
          .from('profiles')
          .update({
            full_name: fullName,
            avatar_url: avatarUrl
          })
          .eq('id', user.id);
      }
    }

    // Successfully authenticated - redirect to next page
    throw redirect(303, next);
  } catch (err) {
    console.error('Error in auth callback:', err);
    
    // If it's already a redirect, just throw it
    if (err instanceof Response && err.status === 303) {
      throw err;
    }

    // Otherwise, redirect to auth with a generic error
    throw redirect(303, '/auth?error=unknown');
  }
};
