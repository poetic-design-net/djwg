export interface Badge {
  _id: string;
  name: string;
  slug: string;
  supabaseId: string;
  permissions: Array<{
    resource: string;
    action: string;
  }>;
}

export interface UserBadge {
  badge_id: string; // Dies ist die Supabase UUID
}

/**
 * Prüft, ob ein User die erforderlichen Badges besitzt
 */
export function hasRequiredBadges(userBadges: UserBadge[], requiredBadges: Badge[]): boolean {
  if (!requiredBadges || requiredBadges.length === 0) {
    return true; // Wenn keine Badges erforderlich sind, hat jeder Zugriff
  }

  if (!userBadges || userBadges.length === 0) {
    return false; // Wenn Badges erforderlich sind, aber User keine hat
  }

  const userBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  // Wir vergleichen die Supabase UUIDs
  return requiredBadges.every(rb => userBadgeIds.has(rb.supabaseId));
}

/**
 * Filtert Pages basierend auf den Badges des Users
 */
export function filterPagesByUserBadges(pages: Record<string, any>, userBadges: UserBadge[]): Record<string, any> {
  const filteredPages: Record<string, any> = {};

  Object.entries(pages).forEach(([id, page]) => {
    if (hasRequiredBadges(userBadges, page.requiredBadges)) {
      filteredPages[id] = page;
    }
  });

  return filteredPages;
}