<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import VideoRatingCard from './VideoRatingCard.svelte';
	
	export let submissions: any[] = [];
	export let viewMode: 'grid' | 'list' = 'grid';
	
	const dispatch = createEventDispatcher();
	
	function handleRate(submission: any, rating: number, comments: string) {
		dispatch('rate', {
			submissionId: submission._id,
			rating,
			comments
		});
	}
	
</script>

<div class={viewMode === 'grid' 
	? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
	: 'space-y-4'}>
	{#each submissions as submission, index}
		<div 
			transition:scale={{ delay: index * 50, duration: 300 }}
			class={viewMode === 'grid' ? '' : 'w-full'}
		>
			<VideoRatingCard 
				{submission}
				{viewMode}
				on:rate={(e) => handleRate(submission, e.detail.rating, e.detail.comments)}
			/>
		</div>
	{/each}
</div>