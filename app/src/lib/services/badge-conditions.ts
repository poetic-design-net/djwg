import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '$lib/types/profile';
import { isProfileComplete } from '$lib/utils/profile-utils';

export const DJ_LEVEL_1_ID = '4d2e1bf7-37e7-4226-9239-f8a60f608900';
export const DJ_LEVEL_2_ID = '023cc4ab-9a20-45db-82d5-c248aacefe0a';

interface BadgeConditionResult {
  shouldHave: boolean;
  reason?: string;
}

/**
 * Prüft, ob ein User ein bestimmtes Badge bereits hat
 */
async function hasBadge(
  supabase: SupabaseClient,
  userId: string,
  badgeId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  return !!data;
}

/**
 * Prüft die Bedingungen für das DJ Level 1 Badge
 */
export async function checkDJLevel1Condition(profile: Profile | null): Promise<BadgeConditionResult> {
  return {
    shouldHave: profile ? isProfileComplete(profile) : false,
    reason: 'Profil vollständig ausgefüllt'
  };
}

/**
 * Prüft die Bedingungen für das DJ Level 2 Badge
 * (manuell zuweisbar, aber nur wenn Level 1 vorhanden ist)
 */
export async function checkDJLevel2Condition(
  supabase: SupabaseClient,
  userId: string
): Promise<BadgeConditionResult> {
  const hasLevel1 = await hasBadge(supabase, userId, DJ_LEVEL_1_ID);
  
  return {
    shouldHave: false, // Immer false, da manuell zugewiesen
    reason: hasLevel1 
      ? 'Wird manuell zugewiesen'
      : 'Benötigt zuerst DJ Level 1'
  };
}

export async function checkAllBadgeConditions(
  supabase: SupabaseClient,
  userId: string,
  profile: Profile | null
): Promise<Map<string, BadgeConditionResult>> {
  const results = new Map<string, BadgeConditionResult>();

  // Prüfe Level 1
  results.set(DJ_LEVEL_1_ID, await checkDJLevel1Condition(profile));
  
  // Prüfe Level 2 nur, wenn Level 1 vorhanden ist
  if (await hasBadge(supabase, userId, DJ_LEVEL_1_ID)) {
    results.set(DJ_LEVEL_2_ID, await checkDJLevel2Condition(supabase, userId));
  }

  return results;
}