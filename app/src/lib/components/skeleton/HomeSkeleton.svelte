<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div in:fade={{ duration: 150 }}>
	<!-- Hero Section Skeleton - matching the actual hero layout -->
	<section class="relative overflow-hidden pt-14 pb-16 bg-black">
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

	<!-- Intro Section Skeleton -->
	<section class="py-24 bg-black">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-12 items-center">
				<!-- Text Content -->
				<div class="space-y-6">
					<div class="h-10 bg-gray-700 rounded w-3/4 animate-pulse" />
					<div class="space-y-3">
						<div class="h-4 bg-gray-700 rounded w-full animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
						<div class="h-4 bg-gray-700 rounded w-4/5 animate-pulse" />
					</div>
					<div class="flex gap-4 pt-4">
						<div class="h-12 bg-green-700 rounded-full w-40 animate-pulse" />
						<div class="h-12 bg-gray-700 rounded-full w-32 animate-pulse" />
					</div>
				</div>
				<!-- Image -->
				<div class="h-96 bg-gray-700 rounded-2xl animate-pulse" />
			</div>
		</div>
	</section>

	<!-- Workshop Cards Section Skeleton -->
	<section class="py-24 bg-gray-900/20">
		<div class="container mx-auto px-4">
			<div class="text-center mb-12">
				<div class="h-10 bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
				<div class="h-5 bg-gray-700 rounded w-96 mx-auto animate-pulse" />
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each Array(3) as _}
					<div class="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700">
						<div class="h-48 bg-gray-700 animate-pulse" />
						<div class="p-6 space-y-4">
							<div class="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
							<div class="space-y-2">
								<div class="h-4 bg-gray-700 rounded w-full animate-pulse" />
								<div class="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
							</div>
							<div class="flex justify-between items-center pt-4">
								<div class="h-5 bg-gray-700 rounded w-24 animate-pulse" />
								<div class="h-10 bg-green-700 rounded-full w-32 animate-pulse" />
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Pricing Section Skeleton -->
	<section class="py-24 bg-black">
		<div class="container mx-auto px-4">
			<div class="text-center mb-12">
				<div class="h-10 bg-gray-700 rounded w-48 mx-auto mb-4 animate-pulse" />
				<div class="h-5 bg-gray-700 rounded w-80 mx-auto animate-pulse" />
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
				{#each Array(3) as _}
					<div class="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
						<div class="h-8 bg-gray-700 rounded w-32 mb-4 animate-pulse" />
						<div class="h-12 bg-gray-700 rounded w-24 mb-6 animate-pulse" />
						<div class="space-y-3 mb-8">
							{#each Array(4) as _}
								<div class="flex items-center gap-3">
									<div class="w-5 h-5 bg-gray-700 rounded-full animate-pulse" />
									<div class="h-4 bg-gray-700 rounded flex-1 animate-pulse" />
								</div>
							{/each}
						</div>
						<div class="h-12 bg-green-700 rounded-full w-full animate-pulse" />
					</div>
				{/each}
			</div>
		</div>
	</section>
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

	:global(.animate-pulse) {
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