import groq from 'groq';
import type { Image } from '@sanity/types';

export interface DJCourse {
  _id: string;
  _type: 'djCourse';
  title: string;
  description?: string;
  slug: {
    current: string;
  };
  coverImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  } & Image;
  chapters: Array<{
    title: string;
    lessons: Array<{
      title: string;
      description?: string;
      videoUrl: string;
      duration?: string;
      resources?: Array<{
        title: string;
        fileUrl: string;
      }>;
    }>;
  }>;
}

export const djCourseQuery = groq`*[_type == "djCourse"] {
  _id,
  _type,
  title,
  description,
  slug,
  coverImage {
    ...,
    asset->
  },
  chapters[] {
    title,
    lessons[] {
      title,
      description,
      videoUrl,
      duration,
      resources[] {
        title,
        fileUrl
      }
    }
  }
}`;

export const djCourseBySlugQuery = groq`*[_type == "djCourse" && slug.current == $slug][0] {
  _id,
  _type,
  title,
  description,
  slug,
  coverImage {
    ...,
    asset->
  },
  chapters[] {
    title,
    lessons[] {
      title,
      description,
      videoUrl,
      duration,
      resources[] {
        title,
        fileUrl
      }
    }
  }
}`;