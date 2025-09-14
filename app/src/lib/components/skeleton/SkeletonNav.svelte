<script lang="ts">
	export let items: number = 10;
	export let animate: boolean = true;
</script>

<div class="bg-black rounded-xl border border-gray-800 overflow-hidden sticky top-6">
	<div class="p-4 border-b border-gray-800">
		<div class="h-6 bg-gray-700 rounded w-24 {animate ? 'animate-pulse' : ''}" />
	</div>
	<nav class="p-2 space-y-1">
		{#each Array(items) as _, i}
			<div class="flex items-center gap-3 px-3 py-2 rounded-lg">
				<div class="w-5 h-5 bg-gray-700 rounded {animate ? 'animate-pulse' : ''}"
					style="animation-delay: {i * 50}ms" />
				<div class="h-4 bg-gray-700 rounded {animate ? 'animate-pulse' : ''}"
					style="width: {80 + Math.random() * 40}px; animation-delay: {i * 50 + 25}ms" />
			</div>
		{/each}
	</nav>
</div>

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.animate-pulse {
		background: linear-gradient(
			90deg,
			rgb(55 65 81) 0%,
			rgb(75 85 99) 50%,
			rgb(55 65 81) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>