<script lang="ts">
  import EventDetail from '$lib/components/EventDetail.svelte';
  import type { PageData } from './$types';
  import { urlFor } from '$lib/sanity/image';
  import type { Event } from '$lib/sanity/queries';

  export let data: PageData;

  type SanityImage = {
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

  // Transform Sanity image references to URLs
  $: event = data.event ? {
    ...data.event,
    tag: data.event.tag,
    image: data.event.image ? urlFor(data.event.image).url() : '',
    gallery: data.event.gallery?.map((img: SanityImage) => urlFor(img).url()) || [],
    locationDetails: data.event.locationDetails ? {
      ...data.event.locationDetails,
      image: urlFor(data.event.locationDetails.image).url()
    } : undefined
  } : null;

  $: console.log('Event data:', data.event); // Debug log
</script>

<EventDetail 
  {event} 
  artists={data.artists.data} 
  timeSlots={data.timeSlots}
/>
