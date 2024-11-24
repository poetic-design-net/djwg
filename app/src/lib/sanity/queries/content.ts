import groq from 'groq';
import type { PortableTextBlock } from '@portabletext/types';
import type { Image } from '@sanity/types';

// SEO interface
export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

// Site Settings interface and query
export interface SiteSettings {
  seo: SEO;
  title: string;
  description: string;
  keywords: string[];
  socialMedia: {
    instagram?: string;
    soundcloud?: string;
    facebook?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  },
  title,
  description,
  keywords,
  socialMedia,
  contact
}`;

// Footer Settings interface and query
export interface FooterSettings {
  description: string;
  eventsNavigation: Array<{
    title: string;
    link: string;
  }>;
  infoNavigation: Array<{
    title: string;
    link: string;
  }>;
  socialMedia: Array<{
    platform: 'instagram' | 'facebook' | 'tiktok';
    url: string;
  }>;
}

export const footerSettingsQuery = groq`*[_type == "footerSettings"][0] {
  description,
  eventsNavigation[] {
    title,
    link
  },
  infoNavigation[] {
    title,
    link
  },
  socialMedia[] | order(platform asc) {
    platform,
    url
  }
}`;

export const aboutUsQuery = groq`*[_type == "aboutUs"][0] {
  history {
    title,
    content
  },
  philosophy {
    title,
    items[] {
      title,
      description
    }
  },
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  }
}`;

export interface AboutUs {
  history: {
    title: string;
    content: PortableTextBlock[];
  };
  philosophy: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  seo?: SEO;
}

export const founderQuery = groq`*[_type == "founder"][0] {
  name,
  role,
  image {
    asset->,
    hotspot
  },
  description,
  quote,
  socials {
    instagram,
    soundcloud
  }
}`;

export interface Founder {
  name: string;
  role: string;
  image: Image;
  description: PortableTextBlock[];
  quote?: string;
  socials: {
    instagram?: string;
    soundcloud?: string;
  };
}

export const faqsQuery = groq`*[_type == "faq"] | order(order asc)`;

export interface FAQ {
  _type: 'faq';
  question: string;
  answer: string;
  category: 'workshop' | 'equipment' | 'booking' | 'general';
  order: number;
}

export const knowledgeBaseItemsQuery = groq`*[_type == "knowledgeBaseItem"] | order(category->slug.current asc, title asc) {
  _id,
  title,
  description,
  "icon": category->icon,
  "category": category->slug.current,
  "categoryTitle": category->title,
  content
}`;

export const featuredKnowledgeBaseItemsQuery = groq`*[_type == "knowledgeBaseItem" && featured == true] | order(order asc) {
  _id,
  title,
  description,
  "icon": category->icon,
  "category": category->slug.current,
  "categoryTitle": category->title
}`;

export interface KnowledgeBaseItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  categoryTitle: string;
  content?: PortableTextBlock[];
}

export const categoriesQuery = groq`*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  icon
}`;

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  icon: string;
}
