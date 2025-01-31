import groq from 'groq';
import type { SanityImageSource } from '../image';

// Alle Badges abrufen
export const allBadgesQuery = groq`
*[_type == "badge"] {
  _id,
  name,
  description,
  "slug": slug.current,
  icon {
    asset-> {
      _id,
      _type,
      url,
      metadata
    }
  },
  permissions,
  protectedContent[]-> {
    _type,
    _id,
    title,
    "slug": slug.current
  },
  style
}`

// Einzelnes Badge nach Slug abrufen
export const badgeBySlugQuery = groq`
*[_type == "badge" && slug.current == $slug][0] {
  _id,
  name,
  description,
  "slug": slug.current,
  icon {
    asset-> {
      _id,
      _type,
      url,
      metadata
    }
  },
  permissions,
  protectedContent[]-> {
    _type,
    _id,
    title,
    "slug": slug.current
  },
  style
}`

// Mehrere Badges nach Slugs abrufen
export const badgesBySlugQuery = groq`
*[_type == "badge" && slug.current in $slugs] {
  _id,
  name,
  description,
  "slug": slug.current,
  icon {
    asset-> {
      _id,
      _type,
      url,
      metadata
    }
  },
  permissions,
  protectedContent[]-> {
    _type,
    _id,
    title,
    "slug": slug.current
  },
  style
}`

// Typen für Badge-Daten
export interface Badge {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: SanityImageSource;
  permissions?: Array<{
    type: 'content' | 'feature' | 'area';
    value: string;
  }>;
  protectedContent?: Array<{
    _type: string;
    _id: string;
    title: string;
    slug: string;
  }>;
  style?: {
    color?: 'gold' | 'silver' | 'bronze' | 'premium';
    customColor?: {
      hex: string;
    };
  };
}

// Funktion zum Abrufen aller Badges
export async function getAllBadges(client: any): Promise<Badge[]> {
  return await client.fetch(allBadgesQuery);
}

// Funktion zum Abrufen eines Badges nach Slug
export async function getBadgeBySlug(client: any, slug: string): Promise<Badge | null> {
  return await client.fetch(badgeBySlugQuery, { slug });
}

// Funktion zum Abrufen mehrerer Badges nach Slugs
export async function getBadgesBySlugs(client: any, slugs: string[]): Promise<Badge[]> {
  return await client.fetch(badgesBySlugQuery, { slugs });
}