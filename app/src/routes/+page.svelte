<script lang="ts">
import { useQuery } from '@sanity/svelte-loader';
import type { PageData } from './$types';
import type { Artist, FAQ } from '$lib/sanity/queries';
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

export let data: PageData;
const testimonials = useQuery(data.testimonials);
const logos = useQuery(data.logos);
const events = useQuery(data.events);
const faqs = useQuery(data.faqs);
const featuredKnowledgeBaseItems = useQuery(data.featuredKnowledgeBaseItems);

// Get the artists directly from the server data
const artists = data.artists?.data || [];
$: eventsArray = $events?.data || [];
$: faqsArray = $faqs?.data || [];
$: knowledgeBaseItems = $featuredKnowledgeBaseItems?.data || [];
</script>

<section class="relative overflow-hidden">
	<Herostart />
</section>

<section class="relative pt-20 overflow-hidden">
	<Intro items={knowledgeBaseItems} />
</section>

<section class="pt-48 pb-20">
	<Cards events={eventsArray} />
</section>
	
<section class="pt-48 pb-20">
	<ArtistsSlider artists={artists} isLineupRevealed={!data.isArtistsSecret} />
</section>

<section class="relative pt-36 overflow-hidden">	
	<Pricing />
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
	<AboutUsSection />
</section>

<section class="relative pt-36 overflow-hidden">	
	<Newsletter />
</section>
