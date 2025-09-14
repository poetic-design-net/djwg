<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import type { FAQ, Testimonial, KnowledgeBaseItem, SiteSettings } from '$lib/sanity/queries';
	import type { Logo } from '$lib/types/menu';
	import type { TransformedEvent } from '$lib/sanity/queries/events';
	import type { PortableTextBlock } from '@portabletext/types';
	import type { HomePage } from '$lib/sanity/queries/homepage';

	// Components
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

	// Skeleton Components
	import HeroSkeleton from '$lib/components/skeleton/HeroSkeleton.svelte';
	import HomeSkeleton from '$lib/components/skeleton/HomeSkeleton.svelte';

	export let data: PageData & { streaming?: boolean };

	// Loading state management
	let isLoading = true;
	let dataReady = false;
	let heroReady = false;

	// Progressive loading with immediate hero display
	onMount(() => {
		// Quick hero load
		setTimeout(() => {
			heroReady = true;
		}, 100);

		// Full data ready
		setTimeout(() => {
			isLoading = false;
			dataReady = true;
		}, 300);
	});

	// Get initial data with fallbacks
	const homeData = data.homePage?.options?.initial as HomePage || null;
	const eventsArray = (data.events?.data as TransformedEvent[]) || [];
	const faqsArray = (data.faqs?.options?.initial as FAQ[]) || [];
	const knowledgeBaseItems = (data.featuredKnowledgeBaseItems?.options?.initial as KnowledgeBaseItem[]) || [];
	const siteSettingsData = data.siteSettings?.options?.initial as SiteSettings || null;

	// Format and randomize logos
	const logosData: Logo[] = ((data.logos?.options?.initial as any[]) || [])
		.map(logo => ({
			...logo,
			image: {
				...logo.image,
				asset: {
					_type: 'reference',
					_ref: String(logo.image?.asset?._id || logo.image?.asset?._ref) || '',
				}
			}
		}))
		.sort(() => Math.random() - 0.5);

	const testimonialsData = { data: (data.testimonials?.options?.initial as Testimonial[]) || [] };

	// Event and Ticket Stores
	const selectedEventStore = writable(homeData?.pricingSection?.selectedEvent || eventsArray[0]);
	const eventTicketsStore = writable(eventsArray[0]?.tickets ?? []);
	const showEventSelectorStore = writable(
		homeData?.pricingSection?.showEventSelector ?? (eventsArray.length > 1)
	);

	// Initial event selection
	$: {
		if (eventsArray.length > 0) {
			const initialEvent = homeData?.pricingSection?.selectedEvent || eventsArray[0];
			selectedEventStore.set(initialEvent);
			const eventTickets = eventsArray.find(e => e._id === initialEvent._id)?.tickets ?? [];
			eventTicketsStore.set(eventTickets);
		}
	}

	// Event change handler
	function handleEventChange(event: CustomEvent<TransformedEvent>) {
		const selectedEvent = event.detail;
		selectedEventStore.set(selectedEvent);
		const eventTickets = eventsArray
			.find(e => e._id === selectedEvent._id)
			?.tickets ?? [];
		eventTicketsStore.set(eventTickets);
	}

	// Default PortableText block for title
	const defaultTitle: PortableTextBlock[] = [{
		_type: 'block',
		children: [{
			_type: 'span',
			text: "Werde zum DJ-Profi"
		}]
	}];

	// SEO data with fallbacks
	$: seo = homeData?.seo || siteSettingsData?.seo || {
		metaTitle: 'DJ Workshop Germany | Professionelle DJ Workshops',
		metaDescription: 'Lerne das DJing von erfahrenen Profis. Unsere Workshops bieten praktische Erfahrung, modernste Ausrüstung und individuelle Betreuung.',
		ogImage: '/assets/home_hero.jpg'
	};

	// Define sections for navigation
	$: sections = [
		{ id: 'hero', label: 'Start' },
		{ id: 'intro', label: 'Intro' },
		{ id: 'workshops', label: 'Workshops' },
		{ id: 'tickets', label: 'Tickets' },
		...(logosData.length > 0 ? [{ id: 'partners', label: 'Partner' }] : []),
		...(testimonialsData.data.length > 0 ? [{ id: 'testimonials', label: 'Testimonials' }] : []),
		{ id: 'faq', label: 'FAQ' },
		...(homeData?.aboutSection ? [{ id: 'about', label: 'About' }] : []),
		{ id: 'newsletter', label: 'Newsletter' }
	];
</script>

<Seo {seo} />

{#if isLoading && !heroReady}
	<!-- Show skeleton immediately -->
	<HomeSkeleton />
{:else}
	<!-- Navigation (shows immediately) -->
	<div in:fade={{ duration: 300 }}>
		<SectionNav
			{sections}
			enabled={homeData?.enableSectionNav ?? true}
			pageTitle={seo.metaTitle}
		/>
	</div>

	<!-- Hero Section (shows first) -->
	{#if !heroReady}
		<HeroSkeleton />
	{:else}
		<div in:fade={{ duration: 400 }}>
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
		</div>
	{/if}

	<!-- Main Content (progressive loading) -->
	{#if dataReady}
		<div in:fade={{ duration: 400, delay: 200 }}>
			<!-- Intro Section -->
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

			<!-- Workshops Section -->
			<section id="workshops" class="py-24">
				<Cards
					events={eventsArray}
					title={homeData?.workshopsSection?.title ?? ''}
					description={homeData?.workshopsSection?.description ?? ''}
				/>
			</section>

			<!-- Pricing Section -->
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

			<!-- Partners Section -->
			{#if logosData.length > 0}
				<section id="partners" class="relative py-36 overflow-hidden">
					<Logos
						logos={logosData}
						eyebrow={homeData?.logosSection?.eyebrow}
						headline={homeData?.logosSection?.headline}
						description={homeData?.logosSection?.description}
						showButton={homeData?.logosSection?.showButton ?? true}
					/>
				</section>
			{/if}

			<!-- Testimonials Section -->
			{#if testimonialsData.data.length > 0}
				<Testimonials testimonials={testimonialsData} />
			{/if}

			<!-- FAQ Section -->
			<section id="faq" class="relative pt-24 overflow-hidden">
				<Faq faqs={faqsArray} />
			</section>

			<!-- About Section -->
			{#if homeData?.aboutSection?.title}
				<section id="about" class="relative pt-24 overflow-hidden">
					<AboutUsSection
						tagline={homeData.aboutSection?.tagline ?? ''}
						title={homeData.aboutSection?.title ?? ''}
						paragraphs={homeData.aboutSection?.paragraphs ?? []}
						cta={homeData.aboutSection?.cta ?? { text: '', link: '' }}
						mainImage={homeData.aboutSection?.mainImage}
					/>
				</section>
			{/if}

			<!-- Newsletter Section -->
			<section id="newsletter" class="relative pt-36 overflow-hidden">
				<Newsletter
					title={homeData?.newsletterSection?.title ?? ''}
					description={homeData?.newsletterSection?.description ?? ''}
				/>
			</section>
		</div>
	{/if}
{/if}

<style>
	/* Smooth page transitions */
	:global(.page-enter) {
		animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>