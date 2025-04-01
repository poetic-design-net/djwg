import type { SanityImageSource } from '$lib/sanity/image';
import type { PortableTextBlock } from '@portabletext/types';

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
  description: PortableTextBlock[];
  image: SanityImageSource;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  externalLinks?: ExternalLinks;
}