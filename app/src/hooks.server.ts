import * as Sentry from '@sentry/sveltekit';
import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity/client';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';
import type { User } from '@supabase/supabase-js';

Sentry.init({
    dsn: "https://2ce9830d7f9b44fb02f10e6a023a1d8e@o4508806453526528.ingest.de.sentry.io/4508806537609296",
    tracesSampleRate: 1
})

// Sets the client to be used by `loadQuery` when fetching data on the server.
setServerClient(serverClient);

// Simple in-memory cache for user data
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxEntries: number;

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Refresh item position
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  entries(): Array<[K, V]> {
    return Array.from(this.cache.entries());
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  hasExpired(key: K, ttl: number): boolean {
    const value = this.cache.get(key) as { timestamp: number } | undefined;
    return value ? Date.now() - value.timestamp > ttl : true;
  }
}

const userCache = new LRUCache<string, { user: User | null; timestamp: number }>(1000);
const CACHE_TTL = 60 * 1000; // 1 minute
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Exponential Backoff Retry
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
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
  throw lastError instanceof Error ? lastError : new Error('Unknown error occurred');
}

// Health check function
async function checkSupabaseHealth(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Rate limiting map
class RateLimiter {
  private windows = new Map<string, { count: number; timestamps: number[] }>();
  private readonly windowSize: number;
  private readonly maxRequests: number;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(windowSize: number = 60000, maxRequests: number = 100) {
    this.windowSize = windowSize;
    this.maxRequests = maxRequests;
    this.cleanupInterval = setInterval(() => this.cleanup(), windowSize);
  }

  isLimited(identifier: string): { limited: boolean; current: number } {
    const now = Date.now();
    const window = this.windows.get(identifier) || { count: 0, timestamps: [] };
    
    // Entferne alte Timestamps
    window.timestamps = window.timestamps.filter(ts => now - ts < this.windowSize);
    window.count = window.timestamps.length;

    if (window.count >= this.maxRequests) {
      return { limited: true, current: window.count };
    }

    // Füge neuen Request hinzu
    window.timestamps.push(now);
    window.count++;
    this.windows.set(identifier, window);

    return { limited: false, current: window.count };
  }

  private cleanup() {
    const now = Date.now();
    for (const [identifier, window] of this.windows.entries()) {
      if (now - Math.max(...window.timestamps) > this.windowSize) {
        this.windows.delete(identifier);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  getCurrentCount(identifier: string): number {
    return this.windows.get(identifier)?.count || 0;
  }
}

const rateLimiter = new RateLimiter();

// Sanity preview handler - must be first
const sanityHandler: Handle = createRequestHandler();

// Supabase auth handler - comes after Sanity
const supabaseHandler: Handle = async ({ event, resolve }) => {
  try {
    const clientIp = event.getClientAddress();
    
    // Rate limiting check
    const rateLimitResult = rateLimiter.isLimited(clientIp);
    if (rateLimitResult.limited) {
      return new Response('Too Many Requests', { status: 429 });
    }

    // Create Supabase client for each request
    event.locals.supabase = createSupabaseServerClient({
      supabaseUrl: PUBLIC_SUPABASE_URL,
      supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
      event,
    });

    // Health check
    await checkSupabaseHealth(event.locals.supabase);

    // Get session with retry
    const sessionResult = await retryWithBackoff(() =>
      event.locals.supabase.auth.getSession()
    );

    const { data: { session }, error: sessionError } = sessionResult;

    // Enhanced getUser with caching
    event.locals.getUser = async () => {
      try {
        if (!session) {
          return null;
        }

        const userId = session.user.id;
        const now = Date.now();

        // Check cache first
        const cached = userCache.get(userId);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          return cached.user;
        }

        // Get user with retry
        const userResult = await retryWithBackoff(() =>
          event.locals.supabase.auth.getUser()
        );

        const { data: { user }, error } = userResult;

        if (error) {
          return null;
        }

        // Validate user authentication
        const validUser = user?.aud === 'authenticated' ? user : null;

        // Update cache
        userCache.set(userId, {
          user: validUser,
          timestamp: now
        });

        return validUser;
      } catch (error) {
        return null;
      }
    };

    // Clean up expired cache entries
    const now = Date.now();
    for (const [userId, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        userCache.delete(userId);
      }
    }

    // Handle the request
    return await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      }
    });
  } catch (error) {
    // Continue with the request even if Supabase fails
    return await resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range';
      }
    });
  }
};

// Error handler with enhanced logging and metrics
const errorHandler: Handle = async ({ event, resolve }) => {
  try {
    const response = await resolve(event);
    return response;
  } catch (error) {
    throw error; // Rethrow to let SvelteKit/Sentry handle the error response
  }
};

// Combine handlers with Sanity first, then auth, then error handling
export const handle = sequence(Sentry.sentryHandle(), sequence(sanityHandler, supabaseHandler, errorHandler));
export const handleError = Sentry.handleErrorWithSentry();