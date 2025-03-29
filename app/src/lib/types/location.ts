import type { SanityImageSource } from '$lib/sanity/image';

export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}

export interface ExternalLinks {
  title: string;
  links: ExternalLink[];
}

export interface LocationDetails {
  name: string;
  description: string;
  image: SanityImageSource;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  externalLinks?: ExternalLinks;
}