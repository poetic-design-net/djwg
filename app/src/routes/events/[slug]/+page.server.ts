import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eventQuery } from '$lib/sanity/queries';
import { urlFor } from '$lib/sanity/image';
import type { Image } from '@sanity/types';

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
}

export const load: PageServerLoad = async ({ params, locals: { loadQuery } }) => {
  try {
    // Load event data with embedded schedule
    const event = await loadQuery<SanityEvent>(eventQuery, { slug: params.slug });
    if (!event?.data) throw error(404, 'Event not found');

    // Transform Sanity image URLs and handle dates
    const transformedEvent = {
      ...event.data,
      image: urlFor(event.data.image).url(),
      gallery: event.data.gallery?.map(img => urlFor(img).url()),
      locationDetails: event.data.locationDetails && {
        ...event.data.locationDetails,
        image: urlFor(event.data.locationDetails.image).url()
      },
      // Transform schedule if it exists
      artists: event.data.artists?.map(artist => ({
        ...artist,
        image: urlFor(artist.image).url()
      })),
      schedule: event.data.schedule ? {
        _id: event.data.schedule._id,
        days: event.data.schedule.days.map(day => ({
          // Ensure date is in ISO format
          date: new Date(day.date).toISOString(),
          stages: day.stages.map(stage => ({
            name: stage.name,
            description: stage.description,
            schedule: stage.schedule.map(item => ({
              time: item.time,
              title: item.title,
              description: item.description,
              icon: item.icon,
              instructor: item.instructor ? {
                name: item.instructor.name,
                role: item.instructor.role,
                image: item.instructor.image ? urlFor(item.instructor.image).url() : undefined
              } : undefined
            }))
          }))
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort days by date
      } : undefined
    };

    console.log('Transformed event schedule:', JSON.stringify(transformedEvent.schedule, null, 2));

    return {
      event: transformedEvent
    };
  } catch (err) {
    console.error('Error loading event:', err);
    throw error(500, 'Could not load event');
  }
};
