import { error } from '@sveltejs/kit';
import { hasRequiredBadges } from '$lib/utils/badge-utils';
import type { UserBadge } from '$lib/utils/badge-utils';
import { AccessDeniedError } from '$lib/utils/errors';

export async function load({ params, parent }) {
  const { pages, user } = await parent();
  const { slug } = params;

  // Finde die Seite anhand des Slugs
  const page = Object.values(pages).find((p: any) => p.slug === slug && !p.isDraft);

  if (!page) {
    throw error(404, 'Seite nicht gefunden');
  }

  // Prüfe, ob die Seite Badge-geschützt ist
  if (page.requiredBadges?.length > 0) {
    // Hole die User-Badges aus der Session
    const userBadges = user?.badges as UserBadge[] || [];

    // Prüfe, ob der User die erforderlichen Badges hat
    if (!hasRequiredBadges(userBadges, page.requiredBadges)) {
      throw new AccessDeniedError(
        'Diese Seite erfordert spezielle Berechtigungen',
        page.requiredBadges
      );
    }
  }

  return { page };
}
