<script lang="ts">
  import { onMount } from 'svelte';
  import { page as pageStore } from '$app/stores';
  import type { Section, ComponentSectionType } from '$lib/types/menu';
  import type { Page } from '@sveltejs/kit';
  import AboutUsSection from '$lib/components/AboutUsSection.svelte';

  // Liste der Routen, die einen vollständigen Reload benötigen
  const FORCE_RELOAD_ROUTES = ['award', 'merch'];
  
  let previousPath: string | null = null;
  
  onMount(() => {
    // Speichere den initialen Pfad
    previousPath = window.location.pathname;
    
    // Überwache Änderungen der URL
    return pageStore.subscribe((currentPage: Page) => {
      const currentPath = window.location.pathname;
      const currentSlug = currentPath.split('/').pop();
      const previousSlug = previousPath?.split('/').pop();
      
      // Prüfe ob wir zwischen Routen navigieren, die einen Reload benötigen
      if (previousSlug && currentSlug &&
          FORCE_RELOAD_ROUTES.includes(previousSlug) &&
          FORCE_RELOAD_ROUTES.includes(currentSlug) &&
          previousSlug !== currentSlug) {
        window.location.href = currentPath;
      }
      
      previousPath = currentPath;
    });
  });
  import ArtistsGrid from '$lib/components/ArtistsGrid.svelte';
  import ArtistsSlider from '$lib/components/ArtistsSlider.svelte';
  import Events from '$lib/components/Events.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import Founder from '$lib/components/Founder.svelte';
  import Hero from '$lib/components/hero/start.svelte';
  import Intro from '$lib/components/Intro.svelte';
  import Newsletter from '$lib/components/Newsletter.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Team from '$lib/components/Team.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import LegalPage from '$lib/components/LegalPage.svelte';
  import Logos from '$lib/components/Logos.svelte';
  import Merch from '$lib/components/Merch.svelte';

  export let data;

  const { page } = data;

  const componentMap = {
    aboutUs: AboutUsSection,
    artists: ArtistsGrid,
    hero: Hero,
    events: Events,
    faq: FAQ,
    founder: Founder,
    intro: Intro,
    welcome: Intro,
    logos: Logos,
    newsletter: Newsletter,
    pricing: Pricing,
    team: Team,
    testimonials: Testimonials,
    merch: Merch
  };

  function renderSection(section: Section) {
    if (!section?.type) return null;

    const type = section.type as ComponentSectionType;
    let Component: any = componentMap[type];

    // Spezialfall für Artists Slider
    if (type === 'artists' && section.artistsSection?.displayType === 'slider') {
      Component = ArtistsSlider;
    }

    if (!Component) return null;

    // Basis-Props
    const baseProps = {
      id: section.id || `section-${Date.now()}`
    };

    // Section-spezifische Props
    let sectionProps = {};

    switch (type) {
      case 'events':
        sectionProps = { events: page.events || [] };
        break;
      case 'founder':
        sectionProps = { founderData: page.founder };
        break;
      case 'pricing':
        if (section.pricingSection) {
          const { selectedTickets, ...rest } = section.pricingSection;
          sectionProps = {
            ...rest,
            tickets: selectedTickets || []
          };
        }
        break;
      case 'hero':
        sectionProps = section.heroSection || {};
        break;
      case 'intro':
      case 'welcome':
        sectionProps = section.introSection || {};
        break;
      case 'aboutUs':
        sectionProps = section.aboutUsSection || {};
        break;
      case 'artists':
        if (section.artistsSection) {
          const { selectedArtists, ...rest } = section.artistsSection;
          sectionProps = {
            ...rest,
            artists: selectedArtists || []
          };
        }
        break;
      case 'faq':
        sectionProps = section.faqSection || {};
        break;
      case 'logos':
        sectionProps = section.logosSection || {};
        break;
      case 'team':
        sectionProps = section.teamSectionConfig || {};
        break;
      case 'testimonials':
        sectionProps = section.testimonialsSection || {};
        break;
      case 'merch':
        if (section.merchSection) {
          const { products, ...rest } = section.merchSection;
          console.log('Merch section products:', products);
          sectionProps = {
            ...rest,
            products: products || []
          };
        }
        break;
      default:
        sectionProps = {};
    }

    return {
      component: Component,
      props: { ...baseProps, ...sectionProps }
    };
  }
</script>

{#if !page}
  <div class="container mx-auto px-4 py-16 text-center">
    <h1 class="text-2xl font-bold mb-4">Seite konnte nicht geladen werden</h1>
    <p class="mb-8">Bitte versuchen Sie es später erneut.</p>
    <a href="/" class="text-blue-600 hover:underline">Zurück zur Startseite</a>
  </div>
{:else if page.sections?.length}
  {#each page.sections as section (section._key)}
    {@const rendered = renderSection(section)}
    {#if rendered}
      <svelte:component
        this={rendered.component}
        {...rendered.props}
        events={page.events}
        founder={page.founder}
      />
    {/if}
  {/each}
{:else if page.content}
  <LegalPage title={page.title || ''} content={page.content} />
{:else}
  <div class="container mx-auto px-4 py-16 text-center">
    <h1 class="text-2xl font-bold mb-4">Keine Inhalte verfügbar</h1>
    <p class="mb-8">Diese Seite enthält derzeit keine Inhalte.</p>
    <a href="/" class="text-blue-600 hover:underline">Zurück zur Startseite</a>
  </div>
{/if}
