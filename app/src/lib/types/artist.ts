import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface TransformedArtist {
  _id: string;
  name: string;
  role?: string;
  image?: SanityImageSource;
  socials?: {
    instagram?: string;
    soundcloud?: string;
  };
  slug?: {
    current: string;
  };
}