import groq from 'groq';
import type { PortableTextBlock } from '@portabletext/types';

export interface DJCourse {
  _id: string;
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  chapters: Array<{
    title: string;
    lessons: Array<{
      title: string;
      description?: string;
      videoUrl: string;
      duration: string;
      chapters?: Array<{
        title: string;
        timestamp: number;
      }>;
      resources?: Array<{
        title: string;
        fileUrl: string;
      }>;
    }>;
  }>;
}

export const djCourseQuery = groq`
  *[_type == "djCourse"] {
    _id,
    title,
    description,
    level,
    prerequisites,
    chapters[] {
      title,
      lessons[] {
        title,
        description,
        videoUrl,
        duration,
        chapters[] {
          title,
          timestamp
        },
        resources[] {
          title,
          "fileUrl": file.asset->url
        }
      }
    }
  }
`;

export const djCourseByIdQuery = groq`
  *[_type == "djCourse" && _id == $id][0] {
    _id,
    title,
    description,
    level,
    prerequisites,
    chapters[] {
      title,
      lessons[] {
        title,
        description,
        videoUrl,
        duration,
        chapters[] {
          title,
          timestamp
        },
        resources[] {
          title,
          "fileUrl": file.asset->url
        }
      }
    }
  }
`;