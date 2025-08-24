import groq from 'groq';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '../image';
import type { SEO } from './content';
import type { Logo } from '$lib/types/menu';
import type { Area } from '$lib/types/area';
import type { Feature, Ticket } from '$lib/types/ticket';
import type { LocationDetails, ExternalLinks } from '$lib/types/location';

export interface EventFAQ {
  _id: string;
  question: string;
  answer: PortableTextBlock[];
  category: string;
}

export interface EventPage {
  title?: string;
  seo: SEO;
  areas?: Area[];
}

export const eventPageQuery = groq`*[_type == "eventPage"][0] {
  title,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  "areas": *[_type == "area"] | order(order asc) {
    _id,
    _type,
    title,
    description,
    button {
      text,
      url
    }
  },
  "tickets": *[_type == "ticket" && references(^._id)] | order(phase asc) {
    _id,
    phase,
    title,
    description,
    "features": features[] {
      _type,
      text,
      info
    },
    status,
    price,
    currency,
    url,
    buttonText
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
  "schedule": *[_type == "eventSchedule" && references(^._id)][0] {
    _id,
    isSecret,
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
          },
          allowRegistration,
          maxRegistrations,
          registrationRequired,
          currentRegistrations
        }
      }
    }
  },
  hasOpenStage,
  isOpenStageSecret,
  features,
  highlights,
  gallery,
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
  "areas": areas[]-> {
    _id,
    _type,
    title,
    description,
    button {
      text,
      url
    }
  },
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
  externalLinks {
    title,
    links[] {
      title,
      url,
      description
    }
  },
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
    "features": features[] {
      _type,
      text,
      info
    },
    status,
    price,
    currency,
    url,
    buttonText
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
  "schedule": *[_type == "eventSchedule" && references(^._id)][0] {
    _id,
    isSecret,
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
          },
          allowRegistration,
          maxRegistrations,
          registrationRequired,
          currentRegistrations
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
  logosSection {
    eyebrow,
    headline,
    description,
    showButton
  },
  logos[]-> {
    _id,
    name,
    image {
      asset->,
      hotspot
    },
    url,
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
    whatsapp,
  },
  isLocationSecret,
  isArtistsSecret,
  "areas": areas[]-> {
    _id,
    _type,
    title,
    description,
    button {
      text,
      url
    }
  },
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
  externalLinks {
    title,
    links[] {
      title,
      url,
      description
    }
  },
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
    "features": features[] {
      _type,
      text,
      info
    },
    status,
    price,
    currency,
    url,
    buttonText
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
        },
        allowRegistration,
        maxRegistrations,
        registrationRequired,
        currentRegistrations
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
  areas?: Area[];
  gallery?: SanityImageSource[];
  locationDetails?: LocationDetails;
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
  tickets?: Ticket[];
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
  areas?: Area[];
  gallery?: SanityImageSource[];
  logosSection?: {
    eyebrow?: string;
    headline?: string;
    description?: string;
    showButton?: boolean;
  };
  logos?: Logo[];
  externalLinks?: ExternalLinks;
  locationDetails?: LocationDetails;
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
  tickets?: Ticket[];
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
