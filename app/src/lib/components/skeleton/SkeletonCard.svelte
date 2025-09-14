<script lang="ts">
	export let lines: number = 3;
	export let showAvatar: boolean = false;
	export let animate: boolean = true;
</script>

<div
	class="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 {animate ? 'animate-pulse' : ''}"
>
	{#if showAvatar}
		<div class="flex items-start gap-4 mb-4">
			<div class="w-12 h-12 bg-gray-700 rounded-full" />
			<div class="flex-1">
				<div class="h-5 bg-gray-700 rounded w-32 mb-2" />
				<div class="h-3 bg-gray-700 rounded w-24" />
			</div>
		</div>
	{/if}

	<div class="space-y-3">
		{#each Array(lines) as _, i}
			<div
				class="h-4 bg-gray-700 rounded"
				style="width: {i === lines - 1 ? '60%' : `${85 + Math.random() * 15}%`}"
			/>
		{/each}
	</div>
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

	.animate-pulse > * {
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