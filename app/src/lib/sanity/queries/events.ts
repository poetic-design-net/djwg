import groq from 'groq';
import type { Image } from '@sanity/types';
import type { SEO } from './content';

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
  }
}`;

// Rest of the file remains unchanged
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
  image,
  schedule,
  hasOpenStage,
  isOpenStageSecret,
  features,
  highlights,
  gallery,
  locationDetails,
  isLocationSecret,
  isArtistsSecret,
  order,
  enableSectionNav,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
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
  locationDetails {
    name,
    description,
    image {
      asset->,
      hotspot
    }
  },
  isLocationSecret,
  isArtistsSecret,
  order,
  enableSectionNav,
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
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

export interface Event {
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
  image: Image;
  schedule?: EventSchedule;
  hasOpenStage: boolean;
  isOpenStageSecret: boolean;
  features: string[];
  highlights: {
    title: string;
    description: string;
    icon: string;
  }[];
  gallery?: Image[];
  locationDetails?: {
    name: string;
    description: string;
    image: Image;
  };
  isLocationSecret: boolean;
  isArtistsSecret: boolean;
  order: number;
  enableSectionNav?: boolean;
  seo?: SEO;
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
    image?: Image;
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
          image?: Image;
        };
      }>;
    }>;
  }>;
}
