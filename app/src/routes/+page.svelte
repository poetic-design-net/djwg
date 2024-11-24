<script lang="ts">
import { useQuery } from '@sanity/svelte-loader';
import type { PageData } from './$types';
import type { Artist, FAQ } from '$lib/sanity/queries';
import type { HomePage } from '$lib/sanity/queries/homepage';
import type { PortableTextBlock } from '@portabletext/types';
import Herostart from '$lib/components/hero/start.svelte';
import Cards from '$lib/components/Cards.svelte';
import Intro from '$lib/components/Intro.svelte';
import Testimonials from '$lib/components/Testimonials.svelte';
import Pricing from '$lib/components/Pricing.svelte';
import Newsletter from '$lib/components/Newsletter.svelte';
import Logos from '$lib/components/Logos.svelte';
import ArtistsSlider from '$lib/components/ArtistsSlider.svelte';
import AboutUsSection from '$lib/components/AboutUsSection.svelte';
import Faq from '$lib/components/FAQ.svelte';
import Seo from '$lib/components/Seo.svelte';

export let data: PageData;
const testimonials = useQuery(data.testimonials);
const logos = useQuery(data.logos);
const events = useQuery(data.events);
const faqs = useQuery(data.faqs);
const featuredKnowledgeBaseItems = useQuery(data.featuredKnowledgeBaseItems);
const siteSettings = useQuery(data.siteSettings);
const homePage = useQuery(data.homePage);

// Get the artists directly from the server data
const artists = data.artists?.data || [];
$: eventsArray = $events?.data || [];
$: faqsArray = $faqs?.data || [];
$: knowledgeBaseItems = $featuredKnowledgeBaseItems?.data || [];
$: homeData = ($homePage?.data || {}) as HomePage;

// Default PortableText block for title if none exists
const defaultTitle: PortableTextBlock[] = [{
  _type: 'block',
  children: [{
    _type: 'span',
    text: "Werde zum DJ-Profi"
  }]
}];

// Get SEO data from homepage or fallback to siteSettings
$: seo = homeData?.seo || $siteSettings?.data?.seo || {
  metaTitle: 'DJ Workshop Germany | Professionelle DJ Workshops',
  metaDescription: 'Lerne das DJing von erfahrenen Profis. Unsere Workshops bieten praktische Erfahrung, modernste Ausrüstung und individuelle Betreuung.',
  ogImage: '/assets/home_hero.jpg'
};
</script>

<Seo {seo} />

<section class="relative overflow-hidden">
	<Herostart 
		title={homeData?.hero?.title ?? ''}
		subtitle={homeData?.hero?.subtitle ?? ''}
		backgroundImage={homeData?.hero?.backgroundImage}
	/>
</section>

<section id="intro" class="relative pt-20 overflow-hidden">
	<Intro 
		items={knowledgeBaseItems}
		title={homeData?.intro?.title ?? defaultTitle}
		description={homeData?.intro?.description ?? ''}
	/>
</section>

<section id="workshops" class="pt-48 pb-20">
	<Cards 
		events={eventsArray}
		title={homeData?.workshopsSection?.title ?? ''}
		description={homeData?.workshopsSection?.description ?? ''}
	/>
</section>
	
<section class="pt-48 pb-20">
	<ArtistsSlider artists={artists} isLineupRevealed={!data.isArtistsSecret} />
</section>

<section class="relative pt-36 overflow-hidden">	
	<Pricing 
		title={homeData?.pricingSection?.title ?? ''}
		description={homeData?.pricingSection?.description ?? ''}
	/>
</section>

<section class="relative pt-36 overflow-hidden">	
	{#if $logos}
		<Logos logos={$logos} />
	{/if}
</section>

<section class="relative py-36 overflow-hidden">	
	{#if $testimonials}
		<Testimonials testimonials={$testimonials} />
	{/if}
</section>

<section class="relative pt-36 overflow-hidden">
	<Faq faqs={faqsArray} />
</section>

<section class="relative pt-36 overflow-hidden">
	{#if homeData?.aboutSection}
		<AboutUsSection data={homeData.aboutSection} />
	{/if}
</section>

<section class="relative pt-36 overflow-hidden">	
	<Newsletter 
		title={homeData?.newsletterSection?.title ?? ''}
		description={homeData?.newsletterSection?.description ?? ''}
	/>
</section>
