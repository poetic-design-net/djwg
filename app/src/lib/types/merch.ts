import type { SanityImage } from './image';
import type { MerchProduct } from './menu';

export interface MerchPage {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    backgroundImage?: SanityImage;
  };
  section: {
    eyebrow: string;
    title: string;
    description: string;
  };
  products: MerchProduct[];
}