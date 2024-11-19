import groq from 'groq';

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`;

export const postQuery = groq`*[_type == "post" && slug.current == $slug][0]`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(_createdAt desc)`;

export const logosQuery = groq`*[_type == "logo"] | order(_createdAt desc)`;

// Updated query to only fetch revealed artists when lineup is revealed
export const artistsQuery = groq`*[_type == "artist"] | order(order asc) {
  _type,
  name,
  role,
  description,
  image,
  socials,
  isRevealed,
  order
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
