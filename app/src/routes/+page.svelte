<script lang="ts">
import { useQuery } from '@sanity/svelte-loader';
import type { PageData } from './$types';
import type { Artist } from '$lib/sanity/queries';
import Herostart from '$lib/components/hero/start.svelte';
import Cards from '$lib/components/Cards.svelte';
import Intro from '$lib/components/Intro.svelte';
import Testimonials from '$lib/components/Testimonials.svelte';
import Pricing from '$lib/components/Pricing.svelte';
import Newsletter from '$lib/components/Newsletter.svelte';
import Logos from '$lib/components/Logos.svelte';
import ArtistsSlider from '$lib/components/ArtistsSlider.svelte';

export let data: PageData;
const testimonials = useQuery(data.testimonials);
const logos = useQuery(data.logos);

// Get the artists directly from the server data
const artists = data.artists?.data || [];
</script>

<section class="relative overflow-hidden">
	<Herostart />
</section>

<section class="relative pt-20 overflow-hidden">
	<Intro />
</section>

<section class="pt-48 pb-20">
	<Cards />
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
	<Newsletter />
</section>
