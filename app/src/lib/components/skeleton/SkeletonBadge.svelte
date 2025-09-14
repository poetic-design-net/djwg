<script lang="ts">
	export let animate: boolean = true;
</script>

<div class="flex items-center justify-center flex-col gap-2 {animate ? 'animate-pulse' : ''}">
	<div class="relative">
		<div class="w-16 h-16 bg-gray-700 rounded-full" />
		<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 rounded-full" />
	</div>
	<div class="h-3 bg-gray-700 rounded w-20" />
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