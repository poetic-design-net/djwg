<script lang="ts">
  import type { ComponentSection, ContentSection, ComponentSectionType } from '$lib/types/menu';
  import AboutUsSection from '$lib/components/AboutUsSection.svelte';
  import ArtistsGrid from '$lib/components/ArtistsGrid.svelte';
  import Hero from '$lib/components/hero/start.svelte';
  import ArtistsSlider from '$lib/components/ArtistsSlider.svelte';
  import Events from '$lib/components/Events.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import Founder from '$lib/components/Founder.svelte';
  import Intro from '$lib/components/Intro.svelte';
  import Newsletter from '$lib/components/Newsletter.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import Team from '$lib/components/Team.svelte';
  import Testimonials from '$lib/components/Testimonials.svelte';
  import LegalPage from '$lib/components/LegalPage.svelte';
  import Logos from '$lib/components/Logos.svelte';
  import { PortableText } from '@portabletext/svelte';

  export let data;

  const { page } = data;

  console.log('Page Data:', page);
  console.log('Page Sections:', page.sections);

  // Komponenten-Map für dynamisches Rendering
  const componentMap: Partial<Record<ComponentSectionType, any>> = {
    aboutUs: AboutUsSection,
    artists: ArtistsGrid, // Default to grid, will be determined by displayType
    hero: Hero,
    events: Events,
    faq: FAQ,
    founder: Founder,
    intro: Intro,
    logos: Logos,
    newsletter: Newsletter,
    pricing: Pricing,
    team: Team,
    testimonials: Testimonials,
  };

  function renderSection(section: ComponentSection | ContentSection) {
    console.log('Rendering section:', section);
    
    if (section._type === 'componentSection') {
      let SectionComponent;
      
      // Determine the component to use
      if (section.type === 'artists' && section.artistsSection?.displayType === 'slider') {
        SectionComponent = ArtistsSlider;
      } else {
        SectionComponent = componentMap[section.type];
      }

      if (SectionComponent) {
        console.log(`Rendering component section:`, section);
        // Basis-Props für alle Komponenten
        const baseProps = { id: section.id };
        
        // Spezifische Props basierend auf dem Komponententyp
        let additionalProps = {};
        switch (section.type) {
          case 'hero':
            if (section.heroSection) {
              additionalProps = {
                ...section.heroSection
              };
            }
            break;
          case 'aboutUs':
            if (section.aboutUsSection) {
              const { tagline, title, paragraphs, cta, mainImage } = section.aboutUsSection;
              additionalProps = {
                tagline,
                title,
                paragraphs,
                cta,
                mainImage
              };
            }
            break;
          case 'artists':
            if (section.artistsSection) {
              const { title, description, selectedArtists, isLineupRevealed } = section.artistsSection;
              additionalProps = {
                title,
                description,
                artists: selectedArtists, // Map to component's expected prop name
                isLineupRevealed
              };
            }
            break;
          case 'events':
            additionalProps = { events: page.events };
            break;
          case 'faq':
            if (section.faqSection) {
              const { title, description, selectedFaqs, showCategories } = section.faqSection;
              additionalProps = {
                title,
                description,
                faqs: selectedFaqs || [], // Verwende die ausgewählten FAQs
                showCategories
              };
            }
            break;
          case 'founder':
            additionalProps = { founder: page.founder };
            break;
          case 'intro':
          case 'welcome':
            if (section.introSection) {
              console.log('Intro Section Data:', section.introSection);
              const { title, description, image, items } = section.introSection;
              additionalProps = {
                title: Array.isArray(title) ? title : [{
                  _type: 'block',
                  children: [{ _type: 'span', text: title || 'Werde zum DJ-Profi' }]
                }],
                description: description || '',
                image: image || undefined,
                items: items || []
              };
              console.log('Intro Props:', additionalProps);
            } else {
              console.warn('No introSection data found for section:', section);
            }
            break;
          case 'logos':
            if (section.logosSection) {
              const { title, description, selectedLogos, showButton } = section.logosSection;
              additionalProps = {
                logos: { data: selectedLogos },
                showButton
              };
            }
            break;
          case 'team':
            if (section.teamSectionConfig) {
              const { title, description, selectedMembers, showLoadMoreButton } = section.teamSectionConfig;
              additionalProps = {
                title,
                description,
                teamMembers: selectedMembers,
                showAllTeam: !showLoadMoreButton
              };
            }
            break;
          case 'pricing':
            if (section.pricingSection) {
              const { title, description, showEventSelector, selectedTickets } = section.pricingSection;
              additionalProps = {
                title,
                description,
                showEventSelector,
                tickets: selectedTickets // Mapping von selectedTickets zu tickets prop
              };
            }
            break;
          case 'testimonials':
            if (section.testimonialsSection) {
              const { title, subtitle, testimonials } = section.testimonialsSection;
              additionalProps = {
                title,
                subtitle,
                testimonials: { data: testimonials }
              };
            }
            break;
        }

        const finalProps = { ...baseProps, ...additionalProps };
        console.log('Final component props:', finalProps);

        return {
          component: SectionComponent,
          props: finalProps
        };
      } else {
        console.warn(`No component found for section type: ${section.type}`);
      }
    } else if (section._type === 'contentSection') {
      console.log('Rendering content section');
      return {
        component: LegalPage,
        props: {
          title: section.title,
          content: section.content
        }
      };
    }
    return null;
  }
</script>

{#if page.sections && page.sections.length > 0}
  {#each page.sections as section (section.id)}
    {@const rendered = renderSection(section)}
    {#if rendered}
      <svelte:component this={rendered.component} {...rendered.props} />
    {/if}
  {/each}
{:else if page.content}
  <LegalPage title={page.title} content={page.content} />
{/if}
