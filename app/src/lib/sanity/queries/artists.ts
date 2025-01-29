import groq from 'groq';
import type { SanityImage } from '$lib/sanity/image';
import type { SEO } from './content';

export const artistsQuery = groq`*[_type == "artist"] | order(order asc) {
  _id,
  name,
  role,
  description,
  image {
    _type,
    asset->,
    hotspot,
    alt
  },
  socials,
  isRevealed,
  order,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  }
}`;

// Query for single artist by slug
export const artistQuery = groq`*[_type == "artist" && _id == $id][0] {
  _id,
  name,
  role,
  description,
  image {
    _type,
    asset->,
    hotspot,
    alt
  },
  socials,
  isRevealed,
  order,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  }
}`;

export interface Artist {
  _id: string;
  name: string;
  role: string;
  description: string;
  image: SanityImage;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
  isRevealed: boolean;
  order: number;
  seo?: SEO;
}

export const teamMembersQuery = groq`*[_type == "teamMember" && isActive == true] | order(order asc) {
  _id,
  name,
  slug,
  role,
  image {
    _type,
    asset->,
    hotspot,
    alt
  },
  bio,
  order,
  socials {
    instagram,
    soundcloud
  }
}`;

export interface TransformedArtist extends Omit<Artist, 'image'> {
  image: SanityImage | null;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  role: string;
  image: SanityImage;
  bio?: string;
  order: number;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
}
