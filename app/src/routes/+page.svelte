<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader';
  import { writable } from 'svelte/store';
  import type { PageData } from './$types';
  import type { FAQ, Logo, Testimonial, KnowledgeBaseItem, SiteSettings } from '$lib/sanity/queries';
  import type { TransformedArtist } from '$lib/sanity/queries/artists';
  import type { TransformedEvent } from '$lib/sanity/queries/events';
  import type { PortableTextBlock } from '@portabletext/types';
  import type { HomePage } from '$lib/sanity/queries/homepage';
  import Herostart from '$lib/components/hero/start.svelte';
  import Cards from '$lib/components/Cards.svelte';
  import Intro from '$lib/components/Intro.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Newsletter from '$lib/components/Newsletter.svelte';
  import Logos from '$lib/components/Logos.svelte';
  import AboutUsSection from '$lib/components/AboutUsSection.svelte';
  import Faq from '$lib/components/FAQ.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import SectionNav from '$lib/components/navigation/SectionNav.svelte';

  export let data: PageData;

  // Get the initial data from the server load
  const homeData = data.homePage.options.initial as HomePage;
  const eventsArray = data.events.data as TransformedEvent[];
  const faqsArray = data.faqs.options.initial as FAQ[];
  const knowledgeBaseItems = data.featuredKnowledgeBaseItems.options.initial as KnowledgeBaseItem[];
  const siteSettingsData = data.siteSettings.options.initial as SiteSettings;

  console.log('Homepage Data:', {
    pricingSection: homeData?.pricingSection,
    showEventSelector: homeData?.pricingSection?.showEventSelector,
    eventsArray,
    tickets: homeData?.pricingSection?.tickets
  });

  // Format and randomize logos data for homepage
  const logosData = {
    data: (data.logos.options.initial as Logo[] || [])
      .map(logo => ({
        ...logo,
        image: {
          ...logo.image,
          asset: {
            _type: 'reference',
            _ref: String(logo.image.asset._id) || '',
            _id: logo.image.asset._id || ''
          }
        }
      }))
      .sort(() => Math.random() - 0.5) // Randomize logos on homepage
  };
  const testimonialsData = { data: data.testimonials.options.initial as Testimonial[] || [] };

  // Event und Ticket Stores initialisieren
  const selectedEventStore = writable(homeData?.pricingSection?.selectedEvent || eventsArray[0]);
  const eventTicketsStore = writable(eventsArray[0]?.tickets ?? []);
  
  // Event Selector Logik
  const showEventSelectorStore = writable(
    homeData?.pricingSection?.showEventSelector ?? (eventsArray.length > 1)
  );

  // Initiale Event-Auswahl
  $: {
    if (eventsArray.length > 0) {
      const initialEvent = homeData?.pricingSection?.selectedEvent || eventsArray[0];
      selectedEventStore.set(initialEvent);
      const eventTickets = eventsArray.find(e => e._id === initialEvent._id)?.tickets ?? [];
      eventTicketsStore.set(eventTickets);
    }
  }

  // Event Change Handler
  function handleEventChange(event: CustomEvent<TransformedEvent>) {
    const selectedEvent = event.detail;
    console.log('Event Change:', { 
      selectedEvent,
      allEvents: eventsArray,
      eventTickets: eventsArray.find(e => e._id === selectedEvent._id)?.tickets
    });
    
    selectedEventStore.set(selectedEvent);
    
    // Finde die Tickets für das ausgewählte Event
    const eventTickets = eventsArray
      .find(e => e._id === selectedEvent._id)
      ?.tickets ?? [];
    
    eventTicketsStore.set(eventTickets);
  }

  // Debug reaktive Stores
  $: console.log('Store Updates:', {
    selectedEvent: $selectedEventStore,
    tickets: $eventTicketsStore,
    showSelector: $showEventSelectorStore
  });

  // Transform artists for ArtistSlider
  $: artists = homeData?.artistsSection?.selectedArtists?.map(artist => ({
    ...artist,
    image: artist.image || null
  })) as TransformedArtist[];

  // Default PortableText block for title if none exists
  const defaultTitle: PortableTextBlock[] = [{
    _type: 'block',
    children: [{
      _type: 'span',
      text: "Werde zum DJ-Profi"
    }]
  }];

  // Get SEO data from homepage or fallback to siteSettings
  $: seo = homeData?.seo || siteSettingsData?.seo || {
    metaTitle: 'DJ Workshop Germany | Professionelle DJ Workshops',
    metaDescription: 'Lerne das DJing von erfahrenen Profis. Unsere Workshops bieten praktische Erfahrung, modernste Ausrüstung und individuelle Betreuung.',
    ogImage: '/assets/home_hero.jpg'
  };

  // Define sections for navigation
  const sections = [
    { id: 'hero', label: 'Start' },
    { id: 'intro', label: 'Intro' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'tickets', label: 'Tickets' },
    ...(logosData.data?.length > 0 ? [{ id: 'partners', label: 'Partner' }] : []),
    ...(testimonialsData.data?.length > 0 ? [{ id: 'testimonials', label: 'Testimonials' }] : []),
    { id: 'faq', label: 'FAQ' },
    ...(homeData?.aboutSection ? [{ id: 'about', label: 'About' }] : []),
    { id: 'newsletter', label: 'Newsletter' }
  ];
</script>

<Seo {seo} />

<SectionNav 
  {sections} 
  enabled={homeData?.enableSectionNav ?? true}
  pageTitle={seo.metaTitle}
/>

<Herostart
  id="hero"
  title={homeData?.hero?.title ?? ''}
  subtitle={homeData?.hero?.subtitle ?? ''}
  eyebrow={homeData?.hero?.eyebrow ?? 'von DJs für DJs'}
  backgroundImages={homeData?.hero?.backgroundImages ?? []}
  transitionInterval={homeData?.hero?.transitionInterval ?? 7.5}
  primaryButton={homeData?.hero?.primaryButton}
  secondaryButton={homeData?.hero?.secondaryButton}
/>

<Intro
  id="intro"
  items={knowledgeBaseItems}
  title={homeData?.intro?.title ?? defaultTitle}
  description={homeData?.intro?.description ?? [{
    _type: 'block',
    children: [{ _type: 'span', text: '' }]
  }]}
  image={homeData?.intro?.image}
  cta={homeData?.intro?.cta}
  secondaryCta={homeData?.intro?.secondaryCta}
/>

<section id="workshops" class="py-24">
  <Cards 
    events={eventsArray}
    title={homeData?.workshopsSection?.title ?? ''}
    description={homeData?.workshopsSection?.description ?? ''}
  />
</section>
  


<Pricing
  id="tickets"
  title={homeData?.pricingSection?.title ?? ''}
  description={homeData?.pricingSection?.description ?? ''}
  tickets={$eventTicketsStore}
  selectedEvent={$selectedEventStore}
  showEventSelector={$showEventSelectorStore}
  events={eventsArray}
  on:eventChange={handleEventChange}
/>

<section id="partners" class="relative py-36 overflow-hidden">  
  {#if logosData.data && logosData.data.length > 0}
    <Logos logos={logosData} />
  {/if}
</section>

<section id="testimonials" class="relative py-24 overflow-hidden">  
  {#if testimonialsData.data && testimonialsData.data.length > 0}
    <Testimonials testimonials={testimonialsData} />
  {/if}
</section>

<section id="faq" class="relative pt-24 overflow-hidden">
  <Faq faqs={faqsArray} />
</section>

<section id="about" class="relative pt-24 overflow-hidden">
  {#if homeData?.aboutSection?.title}
    <AboutUsSection 
      tagline={homeData.aboutSection?.tagline ?? ''}
      title={homeData.aboutSection?.title ?? ''}
      paragraphs={homeData.aboutSection?.paragraphs ?? []}
      cta={homeData.aboutSection?.cta ?? { text: '', link: '' }}
      mainImage={homeData.aboutSection?.mainImage}
    />
  {/if}
</section>

<section id="newsletter" class="relative pt-36 overflow-hidden">  
  <Newsletter 
    title={homeData?.newsletterSection?.title ?? ''}
    description={homeData?.newsletterSection?.description ?? ''}
  />
</section>
