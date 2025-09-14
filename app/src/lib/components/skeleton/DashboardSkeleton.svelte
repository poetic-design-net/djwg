<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8" in:fade={{ duration: 150 }}>
	<div class="container px-6 mx-auto">
		<!-- Header Skeleton -->
		<div class="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
			<div>
				<div class="h-10 bg-gray-800 rounded-lg w-48 mb-2 animate-pulse" />
				<div class="h-5 bg-gray-800 rounded w-64 animate-pulse" />
			</div>

			<div class="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
				<div class="h-10 bg-gray-800 rounded-full w-28 animate-pulse" />
				<div class="h-10 bg-gray-800 rounded-full w-20 animate-pulse" />
			</div>
		</div>

		<!-- Main Dashboard Layout -->
		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Mobile Tab Selector Skeleton -->
			<div class="lg:hidden">
				<div class="h-12 bg-gray-800 rounded-lg animate-pulse" />
			</div>

			<!-- Desktop Sidebar Skeleton -->
			<div class="hidden lg:block w-64 flex-shrink-0">
				<div class="sticky top-6">
					<div class="p-4">
						<div class="h-6 bg-gray-800 rounded w-24 animate-pulse" />
					</div>
					<nav class="p-2 space-y-1">
						{#each Array(11) as _, i}
							<div class="flex items-center gap-3 px-3 py-2 rounded-lg">
								<div class="w-5 h-5 bg-gray-800 rounded animate-pulse" />
								<div class="h-4 bg-gray-800 rounded animate-pulse" style="width: {80 + Math.random() * 40}px" />
							</div>
						{/each}
					</nav>
				</div>
			</div>

			<!-- Main Content Area Skeleton -->
			<div class="flex-1 min-w-0 space-y-6">
				<!-- Mini-Badges Section Skeleton -->
				<div class="p-6">
					<div class="h-6 bg-gray-800 rounded w-32 mb-4 animate-pulse" />
					<div class="flex flex-wrap gap-4">
						{#each Array(5) as _}
							<div class="flex items-center justify-center flex-col gap-2">
								<div class="relative">
									<div class="w-16 h-16 bg-gray-800 rounded-full animate-pulse" />
									<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full animate-pulse" />
								</div>
								<div class="h-3 bg-gray-800 rounded w-20 animate-pulse" />
							</div>
						{/each}
					</div>
				</div>

				<!-- Event Registrations Preview Skeleton -->
				<div class="p-6">
					<div class="h-6 bg-gray-800 rounded w-40 mb-4 animate-pulse" />
					<div class="space-y-3">
						{#each Array(2) as _}
							<div class="h-4 bg-gray-800 rounded w-full animate-pulse" />
						{/each}
					</div>
				</div>

				<!-- Profile Section Skeleton -->
				<div class="p-6">
					<div class="h-8 bg-gray-800 rounded w-48 mb-4 animate-pulse" />
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-gray-800 rounded-full animate-pulse" />
						<div class="flex-1 space-y-3">
							<div class="h-5 bg-gray-800 rounded w-32 animate-pulse" />
							<div class="h-4 bg-gray-800 rounded w-48 animate-pulse" />
							<div class="space-y-2">
								<div class="h-4 bg-gray-800 rounded w-full animate-pulse" />
								<div class="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
								<div class="h-4 bg-gray-800 rounded w-4/5 animate-pulse" />
							</div>
						</div>
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
			rgb(17 24 39) 0%,
			rgb(31 41 55) 50%,
			rgb(17 24 39) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>