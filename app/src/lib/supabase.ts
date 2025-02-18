import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Einfachere Connection Pool Implementation
class SupabaseConnectionPool {
  private static instance: SupabaseConnectionPool;
  private client: SupabaseClient;
  private healthCheckInterval: ReturnType<typeof setInterval>;
  private isHealthy: boolean = true;

  private constructor() {
    this.client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true // Wichtig für das Dashboard
      },
      global: {
        headers: { 'x-application-name': 'dashboard' }
      }
    });

    // Health Check alle 30 Sekunden
    this.healthCheckInterval = setInterval(() => this.checkHealth(), 30000);
    this.checkHealth(); // Initial health check
  }

  public static getInstance(): SupabaseConnectionPool {
    if (!SupabaseConnectionPool.instance) {
      SupabaseConnectionPool.instance = new SupabaseConnectionPool();
    }
    return SupabaseConnectionPool.instance;
  }

  private async checkHealth(): Promise<void> {
    try {
      const { error } = await this.client.from('profiles').select('id').limit(1);
      this.isHealthy = !error;

      if (!this.isHealthy) {
        console.error('Supabase connection unhealthy:', error?.message);
        // Versuche Client neu zu initialisieren
        this.client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true
          },
          global: {
            headers: { 'x-application-name': 'dashboard' }
          }
        });
      }
    } catch (error) {
      this.isHealthy = false;
      console.error('Health check failed:', error instanceof Error ? error.message : String(error));
    }
  }

  public getClient(): SupabaseClient {
    if (!this.isHealthy) {
      console.warn('Getting client while connection is unhealthy');
    }
    return this.client;
  }

  public async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Export einen einzelnen, stabilen Client
export const supabaseClient = SupabaseConnectionPool.getInstance().getClient();

// Typisierte Datenbanktabellen
export interface Database {
  public: {
    Tables: {
      course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          lesson_id?: string;
          completed_at?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          is_public?: boolean;
        };
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          badge?: {
            id: string;
            name: string;
            description?: string;
            style?: {
              borderStyle?: string;
              variant?: string;
            };
          };
        };
      };
    };
  };
}