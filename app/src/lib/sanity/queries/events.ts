import groq from 'groq';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '../image';
import type { SEO } from './content';
import type { Logo } from '$lib/types/menu';

export interface FAQ {
  _id: string;
  question: string;
  answer: PortableTextBlock[];
  category: string;
}

export interface EventPage {
  title?: string;
  seo: SEO;
}

export const eventPageQuery = groq`*[_type == "eventPage"][0] {
  title,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  "tickets": *[_type == "ticket" && references(^._id)] | order(phase asc) {
    _id,
    phase,
    title,
    description,
    features,
    status,
    price,
    currency,
    url
  }
}`;

export const eventsQuery = groq`*[_type == "event"] | order(order asc) {
  _id,
  title,
  tag,
  slug,
  subtitle,
  description,
  date,
  location,
  locationUrl,
  image {
    asset->,
    hotspot
  },
  schedule,
  hasOpenStage,
  isOpenStageSecret,
  features,
  highlights,
  gallery,
  locationDetails,
  isLocationSecret,
  isArtistsSecret,
    artists[]-> {
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
      order
  },
  order,
  enableSectionNav,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  "tickets": *[_type == "ticket" && references(^._id)] | order(phase asc) {
    _id,
    phase,
    title,
    description,
    features,
    status,
    price,
    currency,
    url
  }
}`;

export const eventQuery = groq`*[_type == "event" && slug.current == $slug][0] {
  _id,
  title,
  tag,
  slug,
  subtitle,
  description,
  date,
  location,
  locationUrl,
  image {
    asset->,
    hotspot
  },
  "schedule": *[_type == "eventSchedule" && event._ref == ^._id][0] {
    _id,
    days[] {
      "date": date,
      stages[] {
        name,
        description,
        schedule[] {
          time,
          title,
          description,
          icon,
          instructor-> {
            name,
            role,
            image {
              asset->,
              hotspot
            }
          }
        }
      }
    }
  },
  hasOpenStage,
  isOpenStageSecret,
  features,
  highlights,
  gallery[] {
    asset->,
    hotspot
  },
  logos[]-> {
    _id,
    name,
    image {
      asset->,
      hotspot
    },
    order
  },
  locationDetails {
    name,
    description,
    image {
      asset->,
      hotspot
    },
    website,
    instagram,
    facebook,
    whatsapp
  },
  isLocationSecret,
  isArtistsSecret,
  artists[]-> {
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
    order
  },
  order,
  enableSectionNav,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  faqSection {
    title,
    description,
    showCategories,
    "selectedFaqs": selectedFaqs[]-> {
      _id,
      question,
      answer,
      category
    }
  },
  "tickets": *[_type == "ticket" && references(^._id)] | order(phase asc) {
    _id,
    phase,
    title,
    description,
    features,
    status,
    price,
    currency,
    url
  }
}`;

export const eventScheduleQuery = groq`*[_type == "eventSchedule" && event._ref == $eventId][0] {
  _id,
  event->,
  days[] {
    "date": date,
    stages[] {
      name,
      description,
      schedule[] {
        time,
        title,
        description,
        icon,
        instructor-> {
          name,
          role,
          image {
            asset->,
            hotspot
          }
        }
      }
    }
  }
}`;

export interface SanityEvent {
  _id: string;
  title: string;
  tag: string;
  slug: {
    current: string;
  };
  subtitle: string;
  description: string;
  date: string;
  location: string;
  locationUrl?: string;
  image: SanityImageSource;
  schedule?: EventSchedule;
  hasOpenStage: boolean;
  isOpenStageSecret: boolean;
  features: string[];
  highlights: {
    title: string;
    description: string;
    icon: string;
  }[];
  gallery?: SanityImageSource[];
  locationDetails?: {
    name: string;
    description: string;
    image: SanityImageSource;
    website?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  isLocationSecret: boolean;
  isArtistsSecret: boolean;
  artists?: Array<{
    _id: string;
    name: string;
    role: string;
    description: string;
    image: SanityImageSource;
    socials: {
      instagram?: string;
      soundcloud?: string;
    };
    isRevealed: boolean;
    order: number;
  }>;
  order: number;
  enableSectionNav?: boolean;
  seo?: SEO;
  faqSection?: {
    title?: string;
    description?: string;
    showCategories?: boolean;
    selectedFaqs?: Array<{
      _id: string;
      question: string;
      answer: string;
      category: string;
    }>;
  };
  tickets?: Array<{
    _id: string;
    phase: string;
    title: string;
    description: string;
    features: string[];
    status: 'completed' | 'current' | 'coming-soon';
    price: number;
    currency: string;
    url?: string;
  }>;
}

export interface TransformedEvent {
  _id: string;
  title: string;
  tag: string;
  slug: {
    current: string;
  };
  subtitle: string;
  description: string;
  date: string;
  location: string;
  locationUrl?: string;
  image: SanityImageSource;
  schedule?: {
    _id: string;
    days: Array<{
      date: string;
      stages: Array<{
        name: string;
        description: string;
        schedule: Array<{
          time: string;
          title: string;
          description?: string;
          instructor?: {
            name: string;
            role: string;
            image?: SanityImageSource;
          };
          icon?: string;
        }>;
      }>;
    }>;
  };
  hasOpenStage: boolean;
  isOpenStageSecret: boolean;
  features: string[];
  highlights: {
    title: string;
    description: string;
    icon: string;
  }[];
  gallery?: SanityImageSource[];
  logos?: Logo[];
  locationDetails?: {
    name: string;
    description: string;
    image: SanityImageSource;
  };
  isLocationSecret: boolean;
  isArtistsSecret: boolean;
  artists?: Array<{
    _id: string;
    name: string;
    role: string;
    description: string;
    image: SanityImageSource;
    socials: {
      instagram?: string;
      soundcloud?: string;
    };
    isRevealed: boolean;
    order: number;
  }>;
  order: number;
  enableSectionNav?: boolean;
  seo?: SEO;
  faqSection?: {
    title?: string;
    description: string;
    showCategories: boolean;
    selectedFaqs: Array<{
      _id: string;
      question: string;
      answer: any[];
      category: string;
    }>;
  };
  tickets?: Array<{
    _id: string;
    phase: string;
    title: string;
    description: string;
    features: string[];
    status: 'completed' | 'current' | 'coming-soon';
    price: number;
    currency: string;
    url?: string;
  }>;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  instructor?: string;
  icon?: string;
}

export interface TimeSlot {
  _id: string;
  startTime: string;
  isBlocked: boolean;
  bookings?: Array<{
    name: string;
    email: string;
    createdAt: string;
  }>;
  artist?: {
    name: string;
    image?: SanityImageSource;
  };
}

export interface EventSchedule {
  _id: string;
  days: Array<{
    date: string;
    stages: Array<{
      name: string;
      description: string;
      schedule: Array<{
        time: string;
        title: string;
        description?: string;
        icon?: string;
        instructor?: {
          name: string;
          role: string;
          image?: SanityImageSource;
        };
      }>;
    }>;
  }>;
}
