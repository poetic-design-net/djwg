import groq from 'groq';
import type { Image } from '@sanity/types';

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(_createdAt desc) {
  _id,
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
  name: string;
  role: string;
  quote: string;
  image?: Image;
}
