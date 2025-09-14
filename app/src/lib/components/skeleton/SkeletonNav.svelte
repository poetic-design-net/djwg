<script lang="ts">
	export let items: number = 10;
	export let animate: boolean = true;
</script>

<div
	class="bg-black rounded-xl border border-gray-800 overflow-hidden {animate ? 'animate-pulse' : ''}"
>
	<div class="p-4 border-b border-gray-800">
		<div class="h-6 bg-gray-700 rounded w-24" />
	</div>
	<nav class="p-2">
		{#each Array(items) as _, i}
			<div class="flex items-center gap-3 px-3 py-2 rounded-lg">
				<div class="w-5 h-5 bg-gray-700 rounded" />
				<div class="h-4 bg-gray-700 rounded" style="width: {70 + Math.random() * 30}px" />
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

	.animate-pulse div {
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