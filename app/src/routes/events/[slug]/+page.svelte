<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import EventDetail from '$lib/components/EventDetail.svelte';
	import EventDetailSkeleton from '$lib/components/skeleton/EventDetailSkeleton.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import type { TransformedEvent, TimeSlot } from '$lib/sanity/queries/events';

	export let data: {
		event: TransformedEvent;
		timeSlots: TimeSlot[];
		isAdmin: boolean;
		user: any | null;
		userProfile: any;
		streaming?: boolean;
	};

	// Immediate data access
	$: ({ event, timeSlots, isAdmin, user, userProfile } = data);

	// Loading state management
	let isLoading = true;
	let hasError = false;

	// Progressive loading
	onMount(() => {
		// Quick check if data is available
		if (event) {
			// Small delay for smooth transition
			setTimeout(() => {
				isLoading = false;
			}, 300);
		} else {
			// If no event, show error after delay
			setTimeout(() => {
				isLoading = false;
				hasError = true;
			}, 500);
		}
	});

	// SEO data
	$: seo = event?.seo || {
		metaTitle: event?.title || 'Event',
		metaDescription: event?.description || '',
		ogImage: event?.image?.asset?._ref || ''
	};
</script>

{#if event}
	<Seo
		{seo}
		fallback={{
			title: event.title,
			description: event.description,
			image: event.image?.asset?._ref || ''
		}}
	/>
{/if}

<div class="min-h-screen bg-black">
	{#if isLoading}
		<!-- Show skeleton immediately while loading -->
		<EventDetailSkeleton />
	{:else if hasError || !event}
		<!-- Error state with animation -->
		<div
			class="container mx-auto px-4 py-20 text-center"
			in:fade={{ duration: 300, delay: 100 }}
		>
			<h1 class="text-4xl text-white mb-4">Event nicht gefunden</h1>
			<p class="text-gray-400 mb-8">Das angeforderte Event konnte nicht gefunden werden.</p>
			<a
				href="/events"
				class="inline-flex items-center px-6 py-3 bg-green-500 text-black font-medium rounded-full hover:bg-green-400 transition-colors"
			>
				← Zurück zu allen Events
			</a>
			{#if import.meta.env.DEV}
				<pre class="mt-8 text-left text-xs text-gray-500 bg-black/20 p-4 rounded-lg overflow-auto">
					Debug Info:
					Event Data: {JSON.stringify(event, null, 2)}

					Location Details: {JSON.stringify(event?.locationDetails, null, 2)}
				</pre>
			{/if}
		</div>
	{:else}
		<!-- Main content with smooth transition -->
		<div in:fade={{ duration: 400, delay: 100 }}>
			<EventDetail
				{event}
				{timeSlots}
				{isAdmin}
				{user}
				{userProfile}
			/>
		</div>
	{/if}
</div>

<style>
	/* Smooth transitions for all elements */
	:global(.event-detail-enter) {
		animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>