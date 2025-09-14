<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="relative min-h-screen bg-black overflow-hidden" in:fade={{ duration: 150 }}>
	<!-- Background Skeleton -->
	<div class="absolute inset-0 bg-gray-900 animate-pulse" />

	<!-- Gradient Overlay -->
	<div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black" />

	<!-- Content Container -->
	<div class="relative h-screen flex items-center justify-center px-4">
		<div class="container mx-auto max-w-6xl">
			<div class="text-center space-y-8">
				<!-- Eyebrow Skeleton -->
				<div class="h-6 bg-gray-700 rounded-full w-32 mx-auto animate-pulse" />

				<!-- Title Skeleton -->
				<div class="space-y-4">
					<div class="h-12 md:h-16 lg:h-20 bg-gray-700 rounded w-4/5 mx-auto animate-pulse" />
					<div class="h-12 md:h-16 lg:h-20 bg-gray-700 rounded w-3/5 mx-auto animate-pulse" />
				</div>

				<!-- Subtitle Skeleton -->
				<div class="space-y-3 max-w-2xl mx-auto">
					<div class="h-5 md:h-6 bg-gray-700 rounded w-full animate-pulse" />
					<div class="h-5 md:h-6 bg-gray-700 rounded w-4/5 mx-auto animate-pulse" />
				</div>

				<!-- CTA Buttons Skeleton -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
					<div class="h-14 bg-green-700 rounded-full w-48 animate-pulse" />
					<div class="h-14 bg-gray-700 rounded-full w-40 animate-pulse" />
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator Skeleton -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
		<div class="w-6 h-10 bg-gray-700 rounded-full animate-pulse" />
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

	.animate-pulse {
		background: linear-gradient(
			90deg,
			rgb(31 41 55) 0%,
			rgb(55 65 81) 50%,
			rgb(31 41 55) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>