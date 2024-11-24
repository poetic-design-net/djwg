import groq from 'groq';
import type { Image } from '@sanity/types';

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc) {
  _id,
  _createdAt,
  title,
  slug,
  excerpt,
  mainImage {
    asset->,
    hotspot
  },
  body
}`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  slug,
  excerpt,
  mainImage {
    asset->,
    hotspot
  },
  body
}`;

export interface Post {
  _id: string;
  _type: 'post';
  _createdAt: string;
  title?: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  mainImage?: Image;
  body: any[]; // PortableText content
}

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(_createdAt desc) {
  _id,
  _createdAt,
  name,
  role,
  quote,
  image {
    asset->,
    hotspot
  }
}`;

export interface Testimonial {
  _id: string;
  _type: 'testimonial';
  _createdAt: string;
  name: string;
  role: string;
  quote: string;
  image?: Image;
}

export const logosQuery = groq`*[_type == "logo"] | order(_createdAt desc) {
  _id,
  _createdAt,
  name,
  image {
    asset->,
    hotspot
  }
}`;

export interface Logo {
  _id: string;
  _type: 'logo';
  _createdAt: string;
  name?: string;
  image?: Image;
}
