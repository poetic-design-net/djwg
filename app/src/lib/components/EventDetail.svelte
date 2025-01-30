<script lang="ts">
  import type { TransformedArtist, TimeSlot, TransformedEvent } from '$lib/sanity/queries';
  import Hero from './event/Hero.svelte';
  import About from './event/About.svelte';
  import Location from './event/Location.svelte';
  import Gallery from './event/Gallery.svelte';
  import TimeTable from './event/TimeTable.svelte';
  import TimeTableOverview from './event/TimeTableOverview.svelte';
  import OpenStage from './OpenStage.svelte';
  import ArtistsSlider from './ArtistsSlider.svelte';
  import Pricing from './Pricing.svelte';
  import FAQ from './FAQ.svelte';
  import SectionNav from './navigation/SectionNav.svelte';
  import type { Image } from '@sanity/types';

  interface TransformedInstructor {
    name: string;
    role: string;
    image?: string;
    soundcloud?: string;
    instagram?: string;
  }

  interface Day {
    date: string;
    stages: Array<{
      name: string;
      description: string;
      schedule: Array<{
        time: string;
        title: string;
        description?: string;
        instructor?: TransformedInstructor;
        icon?: string;
      }>;
    }>;
  }

  export let event: TransformedEvent;
  export let timeSlots: TimeSlot[] = [];

  $: artists = (event.artists || []) as TransformedArtist[];
  $: console.log('Event artists data:', event.artists);

  // Extract and validate schedule days
  $: scheduleDays = event.schedule?.days ?? [];
  $: hasValidSchedule = scheduleDays.length > 0;
  
  // Schedule view state
  let scheduleView: 'timeline' | 'overview' = 'timeline';

  // Define sections based on available content
  $: sections = [
    { id: 'hero', label: 'Start' },
    { id: 'about', label: 'About' },
    ...(hasValidSchedule ? [{ id: 'schedule', label: 'Schedule' }] : []),
    ...(event.hasOpenStage ? [{ id: 'openstage', label: 'Open Stage' }] : []),
    { id: 'artists', label: 'Artists' },
    ...(event.locationDetails ? [{ id: 'location', label: 'Location' }] : []),
    { id: 'tickets', label: 'Tickets' },
    ...(event.gallery ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(event.faqSection ? [{ id: 'faq', label: 'FAQ' }] : [])
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

  <div id="tickets" class="py-20 bg-black/40">
    <Pricing tickets={event.tickets || []} />
  </div>

  {#if hasValidSchedule}
    <div id="schedule">
      <div class="container px-4 mx-auto mb-8">
        <div class="flex justify-center gap-4">
          <button
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {scheduleView === 'timeline' ? 'bg-green-500 text-black scale-105' : 'text-white hover:text-green-500 hover:scale-105'}"
            on:click={() => scheduleView = 'timeline'}
          >
            Timeline
          </button>
          <button
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {scheduleView === 'overview' ? 'bg-green-500 text-black scale-105' : 'text-white hover:text-green-500 hover:scale-105'}"
            on:click={() => scheduleView = 'overview'}
          >
            Übersicht
          </button>
        </div>
      </div>
      
      {#if scheduleView === 'timeline'}
        <TimeTable schedule={scheduleDays} />
      {:else}
        <TimeTableOverview schedule={scheduleDays} />
      {/if}
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
    <ArtistsSlider artists={event.artists || []} isLineupRevealed={!event.isArtistsSecret} />
  </div>

  {#if event.locationDetails}
    <div id="location">
      <Location 
        locationDetails={event.locationDetails}
        isSecret={event.isLocationSecret}
      />
    </div>
  {/if}

 

  {#if event.faqSection}
  <div id="faq" class="py-20 bg-black/40">
    <FAQ 
      title={event.faqSection.title}
      description={event.faqSection.description}
      faqs={event.faqSection.selectedFaqs}
      showCategories={event.faqSection.showCategories}
    />
  </div>
{/if}

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
