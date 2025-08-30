<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	
	export let value: number = 5;
	export let max: number = 10;
	export let min: number = 1;
	
	const dispatch = createEventDispatcher();
	
	let hoveredRating = 0;
	let selectedRating = value;
	
	const ratingScale = tweened(1, {
		duration: 200,
		easing: cubicOut
	});
	
	function handleMouseEnter(rating: number) {
		hoveredRating = rating;
		ratingScale.set(1.1);
	}
	
	function handleMouseLeave() {
		hoveredRating = 0;
		ratingScale.set(1);
	}
	
	function selectRating(rating: number) {
		selectedRating = rating;
		dispatch('rate', rating);
	}
	
	function getRatingColor(rating: number) {
		if (rating <= 3) return 'text-red-400';
		if (rating <= 5) return 'text-orange-400';
		if (rating <= 7) return 'text-yellow-400';
		if (rating <= 9) return 'text-green-400';
		return 'text-emerald-400';
	}
	
	function getRatingEmoji(rating: number) {
		if (rating <= 2) return '😟';
		if (rating <= 4) return '😐';
		if (rating <= 6) return '🙂';
		if (rating <= 8) return '😊';
		return '🤩';
	}
	
	$: displayRating = hoveredRating || selectedRating;
</script>

<div class="space-y-4">
	<!-- Rating Display -->
	<div class="text-center">
		<div class="text-6xl mb-2" style="transform: scale({$ratingScale})">
			{getRatingEmoji(displayRating)}
		</div>
		<div class="text-3xl font-medium {getRatingColor(displayRating)}">
			{displayRating}/10
		</div>
	</div>
	
	<!-- Star Rating -->
	<div class="flex justify-center space-x-2">
		{#each Array(max) as _, i}
			{@const rating = i + 1}
			<button
				on:mouseenter={() => handleMouseEnter(rating)}
				on:mouseleave={handleMouseLeave}
				on:click={() => selectRating(rating)}
				class="relative group transition-transform hover:scale-125"
				type="button"
			>
				<span 
					class="text-3xl transition-all duration-200 {
						rating <= displayRating 
							? getRatingColor(displayRating) 
							: 'text-gray-600'
					}"
				>
					{rating <= displayRating ? '★' : '☆'}
				</span>
				
				<!-- Tooltip -->
				<span class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
					{rating}/10
				</span>
			</button>
		{/each}
	</div>
	
	<!-- Quick Select Buttons -->
	<div class="grid grid-cols-5 gap-2">
		{#each [2, 4, 6, 8, 10] as quickRating}
			<button
				on:click={() => selectRating(quickRating)}
				class="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition text-sm font-medium {
					selectedRating === quickRating ? 'ring-2 ring-purple-500' : ''
				}"
				type="button"
			>
				{quickRating}
			</button>
		{/each}
	</div>
	
	<!-- Keyboard Hint -->
	<p class="text-center text-xs text-gray-500">
		Use number keys 1-9 or 0 for 10 to rate quickly
	</p>
</div>

<svelte:window 
	on:keydown={(e) => {
		if (e.key >= '1' && e.key <= '9') {
			selectRating(parseInt(e.key));
		} else if (e.key === '0') {
			selectRating(10);
		}
	}}
/>