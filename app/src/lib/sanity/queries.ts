import groq from 'groq';

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug][0]`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(_createdAt desc)`;

export const logosQuery = groq`*[_type == "logo"] | order(_createdAt desc)`;

export const artistsQuery = groq`*[_type == "artist"] | order(order asc)`;

export const eventsQuery = groq`*[_type == "event"] | order(order asc) {
  _id,
  title,
  tag,
  slug,
  subtitle,
  description,
  date,
  location,
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
  order
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
  order
}`;

export const faqsQuery = groq`*[_type == "faq"] | order(order asc)`;

export const timeSlotsQuery = groq`*[_type == "timeSlot" && event._ref == $eventId] | order(startTime asc) {
  _id,
  startTime,
  duration,
  isBlocked,
  bookings[] {
    name,
    email,
    createdAt
  }
}`;

export interface Post {
  _type: 'post';
  _createdAt: string;
  title?: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  mainImage?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  body: any[];
}

export interface Testimonial {
  _type: 'testimonial';
  _createdAt: string;
  name?: string;
  role?: string;
  content?: string;
}

export interface Logo {
  _type: 'logo';
  _createdAt: string;
  name?: string;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
}

export interface Artist {
  _type: 'artist';
  name: string;
  role: string;
  description: string;
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  };
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
  isRevealed: boolean;
  order: number;
}

export interface ScheduleItem {
  _key?: string;
  time: string;
  title: string;
  description?: string;
  instructor?: string;
  icon?: string;
}

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
  image: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  };
  schedule?: ScheduleItem[];
  hasOpenStage: boolean;
  isOpenStageSecret: boolean;
  features: string[];
  highlights: {
    title: string;
    description: string;
    icon: string;
  }[];
  gallery?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  }[];
  locationDetails?: {
    name: string;
    description: string;
    image: {
      asset: {
        _ref: string;
        _type: 'reference';
      };
      hotspot?: {
        x: number;
        y: number;
        height: number;
        width: number;
      };
    };
  };
  isLocationSecret: boolean;
  isArtistsSecret: boolean;
  order: number;
}

export interface FAQ {
  _type: 'faq';
  question: string;
  answer: string;
  category: 'workshop' | 'equipment' | 'booking' | 'general';
  order: number;
}

export interface TimeSlot {
  _id: string;
  startTime: string;
  duration: number;
  isBlocked: boolean;
  bookings: Array<{
    name: string;
    email: string;
    createdAt: string;
  }>;
}

export interface TimeSlotBooking {
  name: string;
  email: string;
}
