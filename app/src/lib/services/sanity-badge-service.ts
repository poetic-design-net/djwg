import { client } from '$lib/sanity/client';
import { badgesQuery } from '$lib/sanity/queries/badges';
import { badgeStore } from '$lib/stores/badges';

export async function loadSanityBadges() {
  try {
    console.log('Lade Badges aus Sanity...');
    const badges = await client.fetch(badgesQuery);
    const transformedBadges = badges.map((badge: any) => ({
      id: badge._id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon?.asset?.url || null,
      slug: badge.slug?.current,
      supabaseId: badge.supabaseId,
      permissions: badge.permissions,
      conditions: badge.conditions,
      style: badge.style
    }));
    console.log('Transformierte Sanity Badges:', transformedBadges);
    return transformedBadges;
  } catch (error) {
    console.error('Fehler beim Laden der Sanity Badges:', error);
  }
}