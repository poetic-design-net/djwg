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
  columns?: Array<{
    title: string;
    links: Array<{
      text: string;
      url: string;
    }>;
  }>;
  socialLinks?: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
    url: string;
  }>;
  bottomText?: string;
  logo?: Image;
}

export const footerSettingsQuery = groq`*[_type == "footerSettings"][0] {
  columns[] {
    title,
    links[] {
      text,
      url
    }
  },
  socialLinks[] {
    platform,
    url
  },
  bottomText,
  logo {
    asset->
  }
}`;

export const aboutUsQuery = groq`*[_type == "aboutUs"] | order(_createdAt desc)[0] {
  _type,
  _id,
  _createdAt,
  _updatedAt,
  coverImage {
    _type,
    "asset": asset->{
      _id,
      url,
      metadata
    }
  },
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
  coverImage: Image & {
    alt?: string;
  };
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
  "icon": select(
    category->icon == "mixer" => "mixer",
    category->icon == "headphones" => "headphones",
    category->icon == "vinyl" => "vinyl",
    category->icon == "laptop" => "laptop",
    category->icon == "microphone" => "microphone",
    category->icon == "controller" => "controller",
    "controller"
  ),
  "category": category->slug.current,
  "categoryTitle": category->title
}`;

export interface KnowledgeBaseItem {
  _id: string;
  title: string;
  description: string;
  icon: "mixer" | "headphones" | "vinyl" | "laptop" | "microphone" | "controller";
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
