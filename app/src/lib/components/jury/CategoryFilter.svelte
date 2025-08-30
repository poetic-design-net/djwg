<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let categories: Array<{value: string, label: string, icon: string}> = [];
	export let selected: string = 'all';
	
	const dispatch = createEventDispatcher();
	
	function selectCategory(value: string) {
		selected = value;
		dispatch('change', value);
	}
</script>

<div class="flex flex-wrap gap-2 justify-center">
	{#each categories as category}
		<button
			on:click={() => selectCategory(category.value)}
			class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 {
				selected === category.value
					? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
					: 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
			}"
		>
			<span class="text-xl">{category.icon}</span>
			<span>{category.label}</span>
		</button>
	{/each}
</div>