<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	
	export let progress: any;
	export let total: number;
	
	const progressPercent = tweened(0, {
		duration: 1000,
		easing: cubicOut
	});
	
	$: if (progress && total > 0) {
		progressPercent.set((progress.rated_count / total) * 100);
	}
	
	function getProgressColor(percent: number) {
		if (percent < 25) return 'bg-red-500';
		if (percent < 50) return 'bg-orange-500';
		if (percent < 75) return 'bg-yellow-500';
		if (percent < 100) return 'bg-green-500';
		return 'bg-emerald-500';
	}
	
	$: progressColor = getProgressColor($progressPercent);
</script>

<div class="bg-gray-800 rounded-lg border border-gray-700 p-6">
		<div class="space-y-3">
			<!-- Progress Bar -->
			<div class="relative">
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-sm font-medium text-gray-400">Dein Fortschritt</h3>
					<span class="text-sm font-medium text-white">
						{Math.round($progressPercent)}%
					</span>
				</div>
				
				<div class="h-3 bg-gray-800 rounded-full overflow-hidden">
					<div 
						class="h-full {progressColor} rounded-full transition-all duration-1000 relative"
						style="width: {$progressPercent}%"
					>
						<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
					</div>
				</div>
			</div>
			
			<!-- Stats -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="text-center">
					<p class="text-2xl font-medium text-white">
						{progress?.rated_count || 0}
					</p>
					<p class="text-xs text-gray-400">Bewertet</p>
				</div>
				
				<div class="text-center">
					<p class="text-2xl font-medium text-gray-300">
						{total - (progress?.rated_count || 0)}
					</p>
					<p class="text-xs text-gray-400">Verbleibend</p>
				</div>
				
				<div class="text-center">
					<p class="text-2xl font-medium text-green-400">
						{progress?.average_rating || '-'}
					</p>
					<p class="text-xs text-gray-400">Durchschnitt</p>
				</div>
				
				<div class="text-center">
					<p class="text-2xl font-medium text-green-400">
						{total}
					</p>
					<p class="text-xs text-gray-400">Gesamt</p>
				</div>
			</div>
			
			<!-- Achievement Badges -->
			{#if $progressPercent >= 100}
				<div class="flex items-center justify-center space-x-2 pt-2">
					<span class="text-3xl">🎉</span>
					<span class="text-sm font-medium text-green-400">
						Glückwunsch! Du hast alle Videos bewertet!
					</span>
					<span class="text-3xl">🏆</span>
				</div>
			{:else if $progressPercent >= 75}
				<div class="flex items-center justify-center space-x-2 pt-2">
					<span class="text-2xl">💪</span>
					<span class="text-sm text-green-400">
						Fast geschafft! Weiter so!
					</span>
				</div>
			{:else if $progressPercent >= 50}
				<div class="flex items-center justify-center space-x-2 pt-2">
					<span class="text-2xl">⚡</span>
					<span class="text-sm text-yellow-400">
						Halbzeit! Großartiger Fortschritt!
					</span>
				</div>
			{:else if $progressPercent >= 25}
				<div class="flex items-center justify-center space-x-2 pt-2">
					<span class="text-2xl">🚀</span>
					<span class="text-sm text-orange-400">
						Guter Start! Weiter bewerten!
					</span>
				</div>
			{/if}
		</div>
</div>