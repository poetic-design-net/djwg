<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';
	import SubmissionCard from './SubmissionCard.svelte';
	
	export let submissions: any[] = [];
	export let viewMode: 'grid' | 'list' = 'grid';
	export let isAdmin: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	function handleRate(submissionId: string) {
		return (event: CustomEvent) => {
			// SubmissionCard emits {rating, comments} in event.detail
			dispatch('rate', {
				submissionId,
				rating: event.detail.rating,
				comments: event.detail.comments
			});
		};
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
			<SubmissionCard
				{submission}
				{viewMode}
				{isAdmin}
				on:rate={handleRate(submission._id)}
			/>
		</div>
	{/each}
</div>