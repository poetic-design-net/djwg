<script lang="ts">
	import SkeletonCard from './SkeletonCard.svelte';
	import SkeletonBadge from './SkeletonBadge.svelte';
	import SkeletonNav from './SkeletonNav.svelte';
	import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8" in:fade={{ duration: 150 }}>
	<div class="container px-6 mx-auto">
		<!-- Header Skeleton -->
		<div class="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
			<div>
				<div class="h-10 bg-gray-700 rounded w-48 mb-2 animate-pulse" />
				<div class="h-5 bg-gray-700 rounded w-64 animate-pulse" />
			</div>

			<div class="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
				<div class="h-10 bg-gray-700 rounded-full w-28 animate-pulse" />
				<div class="h-10 bg-gray-700 rounded-full w-20 animate-pulse" />
			</div>
		</div>

		<!-- Main Dashboard Layout -->
		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Mobile Tab Selector Skeleton -->
			<div class="lg:hidden">
				<div class="h-12 bg-gray-800 rounded-lg border border-gray-700 animate-pulse" />
			</div>

			<!-- Desktop Sidebar Skeleton -->
			<div class="hidden lg:block w-64 flex-shrink-0">
				<SkeletonNav items={11} />
			</div>

			<!-- Main Content Area Skeleton -->
			<div class="flex-1 min-w-0 space-y-6">
				<!-- Mini-Badges Section Skeleton -->
				<div class="bg-black rounded-xl border border-gray-800 p-6">
					<div class="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
					<div class="flex flex-wrap gap-4">
						{#each Array(5) as _}
							<SkeletonBadge />
						{/each}
					</div>
				</div>

				<!-- Event Registrations Preview Skeleton -->
				<SkeletonCard lines={2} />

				<!-- Profile Section Skeleton -->
				<div class="bg-black rounded-xl border border-gray-800 p-6">
					<div class="h-8 bg-gray-700 rounded w-48 mb-4 animate-pulse" />
					<SkeletonCard lines={4} showAvatar={true} animate={false} />
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
			rgb(55 65 81) 0%,
			rgb(75 85 99) 50%,
			rgb(55 65 81) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>