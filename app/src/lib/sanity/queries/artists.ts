import groq from 'groq';
import type { Image } from '@sanity/types';
import type { SEO } from './content';

export const artistsQuery = groq`*[_type == "artist"] | order(order asc) {
  _id,
  name,
  role,
  description,
  image {
    asset->,
    hotspot
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
    asset->,
    hotspot
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
  image: Image;
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
    asset->,
    hotspot
  },
  bio,
  order,
  socials {
    instagram,
    soundcloud
  }
}`;

export interface TransformedArtist {
  _id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
  isRevealed: boolean;
  order: number;
  seo?: SEO;
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  role: string;
  image: Image;
  bio?: string;
  order: number;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
}
