import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { PostgrestError, User, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase';
import Logger from '$lib/services/logger';

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
        const delay = initialDelay * Math.pow(2, i); // Exponential backoff
        Logger.warn(`Retry attempt ${i + 1} for operation`, {
          ...context,
          error: error instanceof Error ? error.message : String(error),
          nextRetryDelay: delay
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function ensureProfile(event: RequestEvent, user: User): Promise<void> {
  const startTime = Date.now();
  const context = { userId: user.id, operation: 'ensureProfile' };
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
        context
      );

      const existingProfile = result.data as Profile | null;

      if (result.error) {
        Logger.error('Error fetching profile', context, result.error);
        return;
      }

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
        const insertResult = await retryWithBackoff(
          async () => supabase
            .from('profiles')
            .insert([profileData]),
          { ...context, operation: 'insertProfile' }
        );

        if (insertResult.error) {
          Logger.error('Error creating profile', context, insertResult.error);
        }
      } else {
        const updateResult = await retryWithBackoff(
          async () => supabase
            .from('profiles')
            .update(profileData)
            .eq('id', user.id),
          { ...context, operation: 'updateProfile' }
        );

        if (updateResult.error) {
          Logger.error('Error updating profile', context, updateResult.error);
        }
      }
    })();

    // Race zwischen Timeout und Profile Operation
    await Promise.race([profilePromise, timeoutPromise]);

    Logger.info('Profile sync completed', {
      ...context,
      duration: Date.now() - startTime
    });
  } catch (error) {
    Logger.error('Error in profile management', {
      ...context,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function validateSession(event: RequestEvent) {
  const context = { operation: 'validateSession' };
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  const { data: { session }, error: sessionError } = await retryWithBackoff(
    async () => supabase.auth.getSession(),
    context
  );

  if (sessionError || !session) {
    Logger.error('Session validation failed', { 
      error: sessionError?.message 
    });
    throw redirect(303, '/auth?error=session_validation_failed');
  }

  return session;
}

async function validateUser(event: RequestEvent): Promise<User> {
  const context = { operation: 'validateUser' };
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  const { data: { user }, error: userError } = await retryWithBackoff(
    async () => supabase.auth.getUser(),
    context
  );

  if (userError || !user) {
    Logger.error('User validation failed', { 
      error: userError?.message 
    });
    throw redirect(303, '/auth?error=user_validation_failed');
  }

  if (user.aud !== 'authenticated') {
    Logger.error('Invalid audience', { 
      userId: user.id,
      audience: user.aud 
    });
    throw redirect(303, '/auth?error=invalid_audience');
  }

  return user;
}

export const GET = async (event: RequestEvent) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const supabase = event.locals.supabase as SupabaseClient<Database>;

  try {
    // Parameter validieren
    const code = event.url.searchParams.get('code');
    const next = event.url.searchParams.get('next') ?? '/';

    const context = {
      requestId,
      url: event.url.toString(),
      next
    };

    if (!code) {
      Logger.error('No code provided in callback', context);
      throw redirect(303, '/auth?error=no_code');
    }

    if (!supabase) {
      Logger.error('No Supabase client available', context);
      throw redirect(303, '/auth?error=no_client');
    }

    // Session-Code austauschen mit verbessertem Error Handling
    const { error: exchangeError } = await retryWithBackoff(
      async () => supabase.auth.exchangeCodeForSession(code),
      { ...context, operation: 'exchangeCode' }
    );

    if (exchangeError) {
      Logger.error('Code exchange failed', { 
        ...context,
        error: exchangeError.message 
      });
      throw redirect(303, `/auth?error=exchange_error&message=${encodeURIComponent(exchangeError.message)}`);
    }

    // Session und User validieren
    const session = await validateSession(event);
    const user = await validateUser(event);

    // Profil synchronisieren (non-blocking mit Timeout)
    ensureProfile(event, user).catch(error => {
      Logger.error('Profile sync failed', {
        ...context,
        userId: user.id
      }, error);
    });

    // Log successful auth
    Logger.info('Authentication successful', {
      ...context,
      userId: user.id,
      duration: Date.now() - startTime
    });

    throw redirect(303, next);
  } catch (err) {
    if (err instanceof Response && err.status === 303) {
      throw err;
    }

    Logger.error('Unhandled auth error', {
      requestId,
      url: event.url.toString(),
      duration: Date.now() - startTime
    }, err instanceof Error ? err : new Error(String(err)));

    throw redirect(303, '/auth?error=unknown');
  }
};
