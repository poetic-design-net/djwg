import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eventQuery } from '$lib/sanity/queries';
import { urlFor } from '$lib/sanity/image';
import type { Image } from '@sanity/types';

import type { PortableTextBlock } from '@portabletext/types';

interface SanityEvent {
  _id: string;
  title: string;
  tag: string;
  subtitle: string;
  description: string;
  date: string;
  location: string;
  image: Image;
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
            image?: Image;
          };
          icon?: string;
        }>;
      }>;
    }>;
  };
  highlights: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  features?: string[];
  gallery?: Image[];
  locationDetails?: {
    name: string;
    description: string;
    image: Image;
  };
  hasOpenStage?: boolean;
  isOpenStageSecret?: boolean;
  isLocationSecret?: boolean;
  isArtistsSecret?: boolean;
  artists?: Array<{
    _id: string;
    name: string;
    role: string;
    description: string;
    image: Image;
    socials: {
      instagram?: string;
      soundcloud?: string;
    };
    isRevealed: boolean;
    order: number;
  }>;
  faqSection?: {
    title: PortableTextBlock[];
    description?: string;
    showCategories?: boolean;
    selectedFaqs?: Array<{
      _id: string;
      question: string;
      answer: PortableTextBlock[];
      category: string;
    }>;
  };
}

export const load: PageServerLoad = async ({ params, locals: { loadQuery } }) => {
  try {
    // Load event data with embedded schedule
    const event = await loadQuery<SanityEvent>(eventQuery, { slug: params.slug });
    if (!event?.data) throw error(404, 'Event not found');

    // Transform Sanity image URLs and handle dates
    const transformedEvent = {
      ...event.data,
      image: event.data.image,
      gallery: event.data.gallery,
      locationDetails: event.data.locationDetails && {
        ...event.data.locationDetails,
        image: event.data.locationDetails.image
      },
      // Transform schedule if it exists
      artists: event.data.artists?.map(artist => ({
        ...artist,
        image: artist.image
      })),
      // Ensure FAQ section is properly structured with string values
      faqSection: event.data.faqSection ? {
        ...event.data.faqSection,
        title: event.data.faqSection.title || 'Häufig gestellte Fragen',
        description: event.data.faqSection.description || '',
        showCategories: event.data.faqSection.showCategories ?? true,
        selectedFaqs: event.data.faqSection.selectedFaqs || []
      } : undefined,
      schedule: event.data.schedule ? {
        days: (event.data.schedule.days || []).map(day => ({
          // Ensure date is in ISO format
          date: new Date(day.date || new Date()).toISOString(),
          stages: (day.stages || []).map(stage => ({
            name: stage.name || '',
            description: stage.description || '',
            schedule: (stage.schedule || []).map(item => ({
              time: item.time || '',
              title: item.title || '',
              description: item.description || '',
              icon: item.icon || '',
              instructor: item.instructor ? {
                name: item.instructor.name || '',
                role: item.instructor.role || '',
                image: item.instructor.image ? urlFor(item.instructor.image).url() : undefined
              } : undefined
            }))
          }))
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort days by date
      } : undefined
    };

    
    return {
      event: transformedEvent
    };
  } catch (err) {
    console.error('Error loading event:', err);
    throw error(500, 'Could not load event');
  }
};
