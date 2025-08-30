<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	export let statistics: any;
	
	const dispatch = createEventDispatcher();
	
	function close() {
		dispatch('close');
	}
	
	function getRatingDistribution(distribution: Record<number, number>) {
		if (!distribution) return [];
		
		const max = Math.max(...Object.values(distribution));
		return Object.entries(distribution).map(([rating, count]) => ({
			rating: parseInt(rating),
			count: count as number,
			percentage: max > 0 ? ((count as number) / max) * 100 : 0
		}));
	}
</script>

<div 
	transition:fly={{ y: -20, duration: 300 }}
	class="bg-gray-800 rounded-lg border border-gray-700 p-6"
>
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-2xl font-medium text-white flex items-center space-x-2">
			<span>📊</span>
			<span>Jury Statistiken</span>
		</h2>
		<button
			on:click={close}
			class="text-gray-400 hover:text-white transition"
		>
			✕
		</button>
	</div>
	
	<!-- Overall Stats -->
	{#if statistics?.overall}
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="bg-gray-900/50 rounded-lg p-4">
				<p class="text-3xl font-medium text-white">
					{statistics.overall.rated_submissions || 0}
				</p>
				<p class="text-sm text-gray-400">Videos bewertet</p>
			</div>
			
			<div class="bg-gray-900/50 rounded-lg p-4">
				<p class="text-3xl font-medium text-green-400">
					{statistics.overall.completion_percentage || 0}%
				</p>
				<p class="text-sm text-gray-400">Fortschritt</p>
			</div>
			
			<div class="bg-gray-900/50 rounded-lg p-4">
				<p class="text-3xl font-medium text-yellow-400">
					{statistics.overall.average_rating || '-'}
				</p>
				<p class="text-sm text-gray-400">Durchschnitt</p>
			</div>
			
			<div class="bg-gray-900/50 rounded-lg p-4">
				<p class="text-3xl font-medium text-green-400">
					{statistics.overall.pending_submissions || 0}
				</p>
				<p class="text-sm text-gray-400">Offen</p>
			</div>
		</div>
	{/if}
	
	<!-- Category Breakdown -->
	{#if statistics?.categories && Object.keys(statistics.categories).length > 0}
		<div class="mb-6">
			<h3 class="text-lg font-medium text-white mb-3">Kategorien Übersicht</h3>
			<div class="space-y-3">
				{#each Object.entries(statistics.categories) as [category, stats]}
					<div class="bg-gray-900/50 rounded-lg p-3">
						<div class="flex items-center justify-between mb-2">
							<span class="text-white font-medium capitalize">{category}</span>
							<div class="flex items-center space-x-4">
								<span class="text-sm text-gray-400">
									{stats.count} bewertet
								</span>
								<span class="text-sm font-medium text-yellow-400">
									Ø {stats.average}
								</span>
							</div>
						</div>
						
						<!-- Rating Distribution -->
						{#if stats.distribution}
							<div class="flex space-x-1 h-12">
								{#each getRatingDistribution(stats.distribution) as bar}
									<div class="flex-1 flex flex-col items-center justify-end">
										<div 
											class="w-full bg-purple-500 rounded-t"
											style="height: {bar.percentage}%"
											title="{bar.count} Bewertungen mit {bar.rating}"
										></div>
										<span class="text-xs text-gray-500 mt-1">{bar.rating}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Recent Activity -->
	{#if statistics?.recentActivity && statistics.recentActivity.length > 0}
		<div class="mb-6">
			<h3 class="text-lg font-medium text-white mb-3">Recent Activity</h3>
			<div class="space-y-2 max-h-40 overflow-y-auto">
				{#each statistics.recentActivity as activity}
					<div class="flex items-center justify-between text-sm bg-gray-900/30 rounded px-3 py-2">
						<span class="text-gray-400 truncate flex-1">
							{activity.submission_id.slice(0, 8)}...
						</span>
						<span class="text-white font-medium mx-2">
							{activity.rating}/10
						</span>
						<span class="text-xs text-gray-500">
							{new Date(activity.updated_at).toLocaleDateString()}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Leaderboard -->
	{#if statistics?.leaderboard && statistics.leaderboard.length > 0}
		<div>
			<h3 class="text-lg font-medium text-white mb-3">Top bewertete Einreichungen</h3>
			<div class="space-y-2">
				{#each statistics.leaderboard.slice(0, 5) as item, index}
					{#if item.average_rating}
						<div class="flex items-center space-x-3 bg-gray-900/30 rounded px-3 py-2">
							<span class="text-2xl">
								{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
							</span>
							<div class="flex-1">
								<p class="text-white text-sm">
									{item.userName || 'Anonym'}
								</p>
								{#if item.userEmail}
									<p class="text-xs text-gray-400 truncate">{item.userEmail}</p>
								{/if}
							</div>
							<div class="text-right">
								<p class="text-lg font-medium text-yellow-400">
									{item.average_rating.toFixed(1)}
								</p>
								<p class="text-xs text-gray-500">
									{item.total_ratings} {item.total_ratings === 1 ? 'Bewertung' : 'Bewertungen'}
								</p>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>