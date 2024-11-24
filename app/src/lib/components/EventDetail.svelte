<script lang="ts">
  import type { Artist, TimeSlot } from '$lib/sanity/queries';
  import Hero from './event/Hero.svelte';
  import About from './event/About.svelte';
  import Location from './event/Location.svelte';
  import Gallery from './event/Gallery.svelte';
  import TimeTable from './event/TimeTable.svelte';
  import OpenStage from './OpenStage.svelte';
  import ArtistsSlider from './ArtistsSlider.svelte';
  import Pricing from './Pricing.svelte';

  interface Day {
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
          image?: string;
        };
        icon?: string;
      }>;
    }>;
  }

  export let event: {
    _id: string;
    title: string;
    tag: string;
    subtitle: string;
    description: string;
    date: string;
    location: string;
    features?: string[];
    image: string;
    highlights: {
      title: string;
      description: string;
      icon: string;
    }[];
    schedule?: {
      days: Day[];
    };
    gallery?: string[];
    locationDetails?: {
      name: string;
      description: string;
      image: string;
    };
    isLocationSecret?: boolean;
    isArtistsSecret?: boolean;
    hasOpenStage?: boolean;
    isOpenStageSecret?: boolean;
  };

  export let artists: Artist[] = [];
  export let timeSlots: TimeSlot[] = [];

  // Extract and validate schedule days
  $: scheduleDays = event.schedule?.days ?? [];
  $: hasValidSchedule = scheduleDays.length > 0;

  // Debug logging
  $: {
    console.log('Event:', event);
    console.log('Event schedule:', event.schedule);
    console.log('Schedule days:', scheduleDays);
    console.log('Has valid schedule:', hasValidSchedule);
  }
</script>

<div class="min-h-screen bg-black">
  <Hero {event} />

  <About 
    description={event.description}
    features={event.features || []}
    highlights={event.highlights}
  />

  {#if hasValidSchedule}
    <TimeTable schedule={scheduleDays} />
  {/if}

  {#if event.hasOpenStage}
    <OpenStage
      eventId={event._id}
      {timeSlots}
      isAdmin={false}
      isSecret={event.isOpenStageSecret}
    />
  {/if}

  <div class="py-20 bg-black/40">
    <ArtistsSlider {artists} isLineupRevealed={!event.isArtistsSecret} />
  </div>

  {#if event.locationDetails}
    <Location 
      locationDetails={event.locationDetails}
      isSecret={event.isLocationSecret}
    />
  {/if}

  <div class="py-20 bg-black/40">
    <Pricing />
  </div>

  {#if event.gallery}
    <Gallery images={event.gallery} />
  {/if}
</div>

<style>
  /* Force hardware acceleration to prevent jumping */
  :global(body) {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  /* Prevent content jumping on mobile */
  global:html {
    height: -webkit-fill-available;
  }
</style>
