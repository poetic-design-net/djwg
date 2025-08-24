<script lang="ts">
  import type { TransformedArtist, TimeSlot } from '$lib/sanity/queries';
  import type { SanityImageSource } from '$lib/sanity/image';
  
  import type { TransformedEvent } from '$lib/sanity/queries/events';
  import Hero from './event/Hero.svelte';
  import About from './event/About.svelte';
  import Location from './event/Location.svelte';
  import Gallery from './event/Gallery.svelte';
  import Logos from './Logos.svelte';
  import TimeTable from './event/TimeTable.svelte';
  import TimeTableOverview from './event/TimeTableOverview.svelte';
  import OpenStage from './OpenStage.svelte';
  import ArtistsSlider from './ArtistsSlider.svelte';
  import Pricing from './Pricing.svelte';
  import FAQ from './FAQ.svelte';
  import Areas from './Areas.svelte';
  import SectionNav from './navigation/SectionNav.svelte';
  import StructuredEventData from './StructuredEventData.svelte';
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
  export let isAdmin: boolean = false;
  export let user: { id: string; email: string } | null = null;
  export let userProfile: any = null;

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
    { id: 'tickets', label: 'Tickets' },
    ...(event.areas && event.areas.length > 0 ? [{ id: 'areas', label: 'Areas' }] : []),
    ...(hasValidSchedule ? [{ id: 'schedule', label: 'Schedule' }] : []),
    ...(event.hasOpenStage ? [{ id: 'openstage', label: 'Open Stage' }] : []),
    ...(event.artists && event.artists.length > 0 ? [{ id: 'artists', label: 'Artists' }] : []),
    ...(event.locationDetails ? [{ id: 'location', label: 'Location' }] : []),
    ...(event.logos && event.logos.length > 0 ? [{ id: 'logos', label: 'Partner' }] : []),
    ...(event.gallery ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...((event.faqSection?.selectedFaqs ?? []).length > 0 ? [{ id: 'faq', label: 'FAQ' }] : [])
  ];
</script>

<StructuredEventData {event} />

<div class="min-h-screen bg-black relative">
  <SectionNav {sections} enabled={event.enableSectionNav ?? true} />

  <div id="hero">
    <Hero {event} />
  </div>

  <div id="about">
    <About
      description={event.description ?? ''}
      features={event.features || []}
      highlights={event.highlights || []}
    />
  </div>

  {#if event.tickets}
    <div id="tickets" class="py-20 bg-black/40">
      <Pricing tickets={event.tickets} />
    </div>
  {/if}

  {#if event.areas && event.areas.length > 0}
    <div id="areas" class="pb-20 bg-black/40">
      <Areas areas={event.areas} showButton={true} />
    </div>
  {/if}


  {#if event.locationDetails}
    <div id="location">
      <Location
        locationDetails={event.locationDetails}
        locationUrl={event.locationUrl}
        isSecret={event.isLocationSecret}
        externalLinks={event.externalLinks}
      />
    </div>
  {/if}

  {#if hasValidSchedule}
    <div id="schedule">
      <div class="container px-4 mx-auto">
        <div class="flex justify-center gap-4">
          <button
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {scheduleView === 'timeline' ? 'bg-green-500 text-black scale-105' : 'text-white hover:text-green-500 hover:scale-105 border border-gray-700 hover:border-green-500'}"
            on:click={() => scheduleView = 'timeline'}
          >
            Timeline
          </button>
          <button
            class="px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 {scheduleView === 'overview' ? 'bg-[#33cc99] text-black scale-105' : 'text-white hover:text-[#33cc99] hover:scale-105 border border-gray-700 hover:border-[#33cc99]'}"
            on:click={() => scheduleView = 'overview'}
          >
            Übersicht
          </button>
        </div>
      </div>
      
      {#if scheduleView === 'timeline'}
        <TimeTable 
          schedule={scheduleDays} 
          isSecret={event.schedule?.isSecret || false}
          {isAdmin}
          {user}
          {userProfile}
          eventId={event._id}
          eventScheduleId={event.schedule?._id || ''}
        />
      {:else}
        <TimeTableOverview 
          schedule={scheduleDays} 
          isSecret={event.schedule?.isSecret || false}
          {isAdmin}
          {user}
          {userProfile}
          eventId={event._id}
          eventScheduleId={event.schedule?._id || ''}
        />
      {/if}
    </div>
  {/if}

  {#if event.hasOpenStage}
    <div id="openstage" class="min-h-screen flex item-center justify-center">
      <OpenStage
        eventId={event._id}
        {timeSlots}
        {isAdmin}
        {user}
        {userProfile}
        isSecret={event.isOpenStageSecret}
      />
    </div>
  {/if}

  {#if event.artists && event.artists.length > 0}
    <div id="artists" class="py-20 bg-black/40">
      <ArtistsSlider artists={event.artists} isLineupRevealed={!event.isArtistsSecret} />
    </div>
  {/if}


  {#if event.logos && event.logos.length > 0}
    <div id="logos" class="py-20 bg-black/40">
      <Logos 
        logos={event.logos || []} 
        eyebrow={event.logosSection?.eyebrow}
        headline={event.logosSection?.headline}
        description={event.logosSection?.description}
        showButton={event.logosSection?.showButton ?? true}
      />
    </div>
  {/if}

  {#if event.faqSection}
    {@const faqSection = event.faqSection}
    {@const hasFaqs = faqSection.selectedFaqs && faqSection.selectedFaqs.length > 0}
    {#if hasFaqs}
      <div id="faq" class="py-20 bg-black/40">
        <FAQ
          title={faqSection.title || 'Häufig gestellte Fragen'}
          description={faqSection.description}
          faqs={faqSection.selectedFaqs}
          showCategories={faqSection.showCategories ?? false}
        />
      </div>
    {/if}
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
