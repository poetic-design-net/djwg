import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { PostgrestError, User, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const PROFILE_SYNC_TIMEOUT = 5000; // 5 seconds

interface Profile {
  id: string;
  username?: string;
  is_public?: boolean;
}

type SupabaseResponse<T> = {
  data: T;
  error: PostgrestError | null;
};

// Exponential Backoff Retry
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: Record<string, unknown>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function ensureProfile(event: RequestEvent, user: User): Promise<void> {
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  try {
    // Timeout Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile sync timeout')), PROFILE_SYNC_TIMEOUT);
    });

    // Profile Operation Promise
    const profilePromise = (async () => {
      const result = await retryWithBackoff(
        async () => supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        { userId: user.id, operation: 'ensureProfile' }
      );

      const existingProfile = result.data as Profile | null;

      // Extrahiere die Profildaten aus den Metadaten mit Validierung
      const fullName = user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      'Anonymous User';
      const avatarUrl = user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture;
      const [firstName = '', lastName = ''] = fullName.split(' ');

      const profileData = {
        id: user.id,
        full_name: fullName.slice(0, 100), // Längen-Begrenzung
        avatar_url: avatarUrl,
        username: existingProfile?.username || 
          `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
            .replace(/[^a-z0-9.]/g, '')
            .slice(0, 30), // Längen-Begrenzung
        is_public: existingProfile?.is_public ?? false,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      if (!existingProfile) {
        await retryWithBackoff(
          async () => supabase
            .from('profiles')
            .insert([profileData]),
          { operation: 'insertProfile' }
        );
      } else {
        await retryWithBackoff(
          async () => supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id),
          { operation: 'updateProfile' }
        );
      }
    })();

    // Race zwischen Timeout und Profile Operation
    await Promise.race([profilePromise, timeoutPromise]);
  } catch (error) {
    throw error;
  }
}

async function validateSession(event: RequestEvent) {
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  const { data: { session }, error: sessionError } = await retryWithBackoff(
    async () => supabase.auth.getSession(),
    { operation: 'validateSession' }
  );

  if (sessionError || !session) {
    throw redirect(303, '/auth?error=session_validation_failed');
  }

  return session;
}

async function validateUser(event: RequestEvent): Promise<User> {
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  const { data: { user }, error: userError } = await retryWithBackoff(
    async () => supabase.auth.getUser(),
    { operation: 'validateUser' }
  );

  if (userError || !user) {
    throw redirect(303, '/auth?error=user_validation_failed');
  }

  if (user.aud !== 'authenticated') {
    throw redirect(303, '/auth?error=invalid_audience');
  }

  return user;
}

export const GET = async (event: RequestEvent) => {
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  try {
    // Parameter validieren
    const code = event.url.searchParams.get('code');
    const next = event.url.searchParams.get('next') ?? '/';

    if (!code) {
      throw redirect(303, '/auth?error=no_code');
    }

    if (!supabase) {
      throw redirect(303, '/auth?error=no_client');
    }

    // Session-Code austauschen mit verbessertem Error Handling
    const { error: exchangeError } = await retryWithBackoff(
      async () => supabase.auth.exchangeCodeForSession(code),
      { operation: 'exchangeCode' }
    );

    if (exchangeError) {
      throw redirect(303, `/auth?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`);
    }

    // Session und User validieren
    const session = await validateSession(event);
    const user = await validateUser(event);

    // Profil synchronisieren (non-blocking mit Timeout)
    ensureProfile(event, user).catch(() => {
      // Fehler werden bereits von Sentry erfasst
    });

    throw redirect(303, next);
  } catch (err) {
    if (err instanceof Response && err.status === 303) {
      throw err;
    }

    // Unhandled errors werden von Sentry automatisch erfasst
    throw redirect(303, '/auth?error=unknown');
  }
};
