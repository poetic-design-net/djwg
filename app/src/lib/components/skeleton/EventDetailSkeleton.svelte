<script lang="ts">
	import { fade } from 'svelte/transition';
	import SkeletonCard from './SkeletonCard.svelte';
</script>

<div class="min-h-screen bg-black" in:fade={{ duration: 150 }}>
	<!-- Hero Section Skeleton -->
	<div class="relative h-[70vh] min-h-[600px] bg-gray-900 animate-pulse">
		<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
		<div class="absolute bottom-0 left-0 right-0 p-8 md:p-16">
			<div class="container mx-auto">
				<!-- Badge Skeleton -->
				<div class="h-8 bg-gray-700 rounded-full w-32 mb-4 animate-pulse" />

				<!-- Title Skeleton -->
				<div class="h-12 md:h-16 bg-gray-700 rounded w-3/4 mb-4 animate-pulse" />

				<!-- Subtitle Skeleton -->
				<div class="h-6 md:h-8 bg-gray-700 rounded w-1/2 mb-8 animate-pulse" />

				<!-- Info Pills Skeleton -->
				<div class="flex flex-wrap gap-4">
					<div class="h-10 bg-gray-700 rounded-full w-32 animate-pulse" />
					<div class="h-10 bg-gray-700 rounded-full w-40 animate-pulse" />
					<div class="h-10 bg-gray-700 rounded-full w-36 animate-pulse" />
				</div>
			</div>
		</div>
	</div>

	<!-- Content Section Skeleton -->
	<div class="container mx-auto px-4 py-12">
		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-8">
				<!-- Description Section -->
				<div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
					<div class="h-8 bg-gray-700 rounded w-48 mb-6 animate-pulse" />
					<div class="space-y-3">
						<div class="h-4 bg-gray-700 rounded w-full animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-4/5 animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-full animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
					</div>
				</div>

				<!-- Highlights Section -->
				<div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
					<div class="h-8 bg-gray-700 rounded w-32 mb-6 animate-pulse" />
					<div class="grid sm:grid-cols-2 gap-4">
						{#each Array(4) as _}
							<div class="flex items-start gap-4">
								<div class="w-12 h-12 bg-gray-700 rounded-xl animate-pulse flex-shrink-0" />
								<div class="flex-1">
									<div class="h-5 bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
									<div class="h-3 bg-gray-700 rounded w-full animate-pulse" />
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Schedule Section -->
				<div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
					<div class="h-8 bg-gray-700 rounded w-40 mb-6 animate-pulse" />

					<!-- Day Tabs -->
					<div class="flex gap-2 mb-6">
						{#each Array(2) as _}
							<div class="h-10 bg-gray-700 rounded-lg w-32 animate-pulse" />
						{/each}
					</div>

					<!-- Schedule Items -->
					<div class="space-y-4">
						{#each Array(5) as _}
							<div class="flex gap-4 p-4 bg-gray-800/50 rounded-xl">
								<div class="h-6 bg-gray-700 rounded w-16 animate-pulse flex-shrink-0" />
								<div class="flex-1">
									<div class="h-5 bg-gray-700 rounded w-2/3 mb-2 animate-pulse" />
									<div class="h-3 bg-gray-700 rounded w-1/2 animate-pulse" />
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Registration Card -->
				<div class="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 sticky top-24">
					<div class="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
					<div class="h-10 bg-gray-700 rounded w-24 mb-6 animate-pulse" />
					<div class="h-12 bg-green-700 rounded-full w-full mb-4 animate-pulse" />
					<div class="space-y-2">
						<div class="h-3 bg-gray-700 rounded w-full animate-pulse" />
						<div class="h-3 bg-gray-700 rounded w-4/5 animate-pulse" />
					</div>
				</div>

				<!-- Location Card -->
				<div class="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
					<div class="h-6 bg-gray-700 rounded w-24 mb-4 animate-pulse" />
					<div class="h-32 bg-gray-700 rounded-xl mb-4 animate-pulse" />
					<div class="space-y-2">
						<div class="h-4 bg-gray-700 rounded w-full animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
					</div>
				</div>
			</div>
		</div>
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