import type { Event, Artist, TimeSlot } from '$lib/sanity/queries';

export interface PageData {
  event: Event;
  artists: {
    data: Artist[];
  };
  timeSlots: TimeSlot[];
}
