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
  import SectionNav from './navigation/SectionNav.svelte';

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
    locationUrl?: string;
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
    enableSectionNav?: boolean;
  };

  export let artists: Artist[] = [];
  export let timeSlots: TimeSlot[] = [];

  // Extract and validate schedule days
  $: scheduleDays = event.schedule?.days ?? [];
  $: hasValidSchedule = scheduleDays.length > 0;

  // Define sections based on available content
  $: sections = [
    { id: 'hero', label: 'Start' },
    { id: 'about', label: 'About' },
    ...(hasValidSchedule ? [{ id: 'schedule', label: 'Schedule' }] : []),
    ...(event.hasOpenStage ? [{ id: 'openstage', label: 'Open Stage' }] : []),
    { id: 'artists', label: 'Artists' },
    ...(event.locationDetails ? [{ id: 'location', label: 'Location' }] : []),
    { id: 'tickets', label: 'Tickets' },
    ...(event.gallery ? [{ id: 'gallery', label: 'Gallery' }] : [])
  ];
</script>

<div class="min-h-screen bg-black relative">
  <SectionNav {sections} enabled={event.enableSectionNav ?? true} />

  <div id="hero">
    <Hero {event} />
  </div>

  <div id="about">
    <About 
      description={event.description}
      features={event.features || []}
      highlights={event.highlights}
    />
  </div>

  {#if hasValidSchedule}
    <div id="schedule">
      <TimeTable schedule={scheduleDays} />
    </div>
  {/if}

  {#if event.hasOpenStage}
    <div id="openstage" class="min-h-screen flex item-center justify-center">
      <OpenStage
        eventId={event._id}
        {timeSlots}
        isAdmin={false}
        isSecret={event.isOpenStageSecret}
      />
    </div>
  {/if}

  <div id="artists" class="py-20 bg-black/40">
    <ArtistsSlider {artists} isLineupRevealed={!event.isArtistsSecret} />
  </div>

  {#if event.locationDetails}
    <div id="location">
      <Location 
        locationDetails={event.locationDetails}
        isSecret={event.isLocationSecret}
      />
    </div>
  {/if}

  <div id="tickets" class="py-20 bg-black/40">
    <Pricing />
  </div>

  {#if event.gallery}
    <div id="gallery">
      <Gallery images={event.gallery} />
    </div>
  {/if}
</div>

<style>
  /* Force hardware acceleration to prevent jumping */
  :global(body) {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  /* Prevent content jumping on mobile */
  :global(html) {
    height: -webkit-fill-available;
  }
</style>
