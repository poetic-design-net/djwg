<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<!-- Hero Section Skeleton - matching the actual hero layout -->
<section class="relative overflow-hidden pt-14 pb-16 bg-black" in:fade={{ duration: 150 }}>
	<div class="relative z-10 container px-4 mx-auto">
		<div class="flex flex-wrap lg:items-center -m-8">
			<!-- Left side: Text content -->
			<div class="w-full md:w-1/2 p-8">
				<!-- Eyebrow text -->
				<div class="h-5 bg-gray-700 rounded w-24 mb-2.5 animate-pulse" />

				<!-- Title -->
				<div class="mb-10 space-y-4">
					<div class="h-16 lg:h-20 xl:h-24 bg-gray-700 rounded w-full animate-pulse" />
					<div class="h-16 lg:h-20 xl:h-24 bg-gray-700 rounded w-4/5 animate-pulse" />
					<div class="h-16 lg:h-20 xl:h-24 bg-gray-700 rounded w-3/5 animate-pulse" />
				</div>

				<!-- Buttons -->
				<div class="flex flex-wrap -m-2 mb-12">
					<div class="w-auto p-2">
						<div class="h-14 bg-green-700 rounded-full w-40 animate-pulse" />
					</div>
					<div class="w-auto p-2">
						<div class="h-14 bg-gray-700 rounded-full w-40 animate-pulse" />
					</div>
				</div>

				<!-- Subtitle/Description -->
				<div class="space-y-3 md:max-w-md">
					<div class="h-5 bg-gray-700 rounded w-full animate-pulse" />
					<div class="h-5 bg-gray-700 rounded w-5/6 animate-pulse" />
					<div class="h-5 bg-gray-700 rounded w-4/5 animate-pulse" />
				</div>
			</div>

			<!-- Right side: Image placeholder -->
			<div class="w-full md:w-1/2 p-8">
				<div class="w-full aspect-[4/4] max-w-[600px] mx-auto md:mr-0 bg-gray-800 rounded-3xl animate-pulse" />
			</div>
		</div>
	</div>
</section>

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