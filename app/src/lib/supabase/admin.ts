import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
}

if (!PUBLIC_SUPABASE_URL) {
  throw new Error('PUBLIC_SUPABASE_URL is not set');
}

// Admin client mit service_role key für server-seitige Operationen
export const supabaseAdmin = createClient(
  PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Typen für Subscription-Daten
export interface NextLevelSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan_type: 'monthly' | 'quarterly' | 'yearly';
  status: 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface NextLevelDownloadHistory {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  download_date: string;
  ip_address: string | null;
  user_agent: string | null;
}