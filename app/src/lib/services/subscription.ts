import { supabaseClient } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface NextLevelSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan_type: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * Prüft ob ein Benutzer ein aktives NextLevel Abonnement hat
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('nextlevel_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking subscription:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error in hasActiveSubscription:', err);
    return false;
  }
}

/**
 * Holt die aktuelle Subscription eines Benutzers
 */
export async function getCurrentSubscription(userId: string): Promise<NextLevelSubscription | null> {
  try {
    const { data, error } = await supabaseClient
      .from('nextlevel_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in getCurrentSubscription:', err);
    return null;
  }
}

/**
 * Prüft ob ein Benutzer Zugang zu NextLevel DJs hat
 * (entweder durch aktives Abo oder Badge)
 */
export async function hasNextLevelAccess(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    // Erst Badge prüfen (schneller)
    const { data: badges } = await supabaseClient
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id)
      .eq('badge_id', 'b43630a1-86b3-43d2-9fd2-76857a122afd'); // NextLevel Badge ID

    if (badges && badges.length > 0) {
      return true;
    }

    // Dann Subscription prüfen
    return await hasActiveSubscription(user.id);
  } catch (err) {
    console.error('Error checking NextLevel access:', err);
    return false;
  }
}

/**
 * Formatiert Subscription-Status für die Anzeige
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Aktiv',
    canceled: 'Gekündigt',
    past_due: 'Zahlungsrückstand',
    trialing: 'Testphase',
    incomplete: 'Unvollständig'
  };

  return statusMap[status] || status;
}

/**
 * Berechnet verbleibende Tage bis zum Ende der aktuellen Periode
 */
export function getDaysUntilPeriodEnd(periodEnd: string): number {
  const endDate = new Date(periodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Prüft ob eine Subscription bald abläuft (weniger als 7 Tage)
 */
export function isSubscriptionExpiringSoon(subscription: NextLevelSubscription): boolean {
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }

  const daysLeft = getDaysUntilPeriodEnd(subscription.current_period_end);
  return daysLeft <= 7 && daysLeft > 0;
}
