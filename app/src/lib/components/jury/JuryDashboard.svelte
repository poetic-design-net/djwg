<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import VideoGrid from './VideoGrid.svelte';
	import JuryStats from './JuryStats.svelte';
	import ProgressTracker from './ProgressTracker.svelte';
	import { toasts } from '$lib/stores/toast';
	import { subscribeToJuryUpdates, unsubscribeFromJuryUpdates, ratingsStore, statsStore } from '$lib/stores/juryStore';
	import { supabaseClient } from '$lib/supabase';
	
	export let user: any;
	export let isAdmin: boolean = false;
	
	let submissions: any[] = [];
	let filteredSubmissions: any[] = [];
	let progress: any = null;
	let statistics: any = null;
	let loading = true;
	let viewMode: 'grid' | 'list' = 'grid';
	let showStats = false;
	
	onMount(() => {
		loadSubmissions();
		loadStatistics();
		
		// Subscribe to real-time updates
		if (user?.id && supabaseClient) {
			subscribeToJuryUpdates(user.id, supabaseClient);
		}
		
		// Set up auto-refresh every 30 seconds
		const interval = setInterval(() => {
			loadSubmissions(true);
		}, 30000);
		
		return () => clearInterval(interval);
	});
	
	onDestroy(() => {
		// Clean up real-time subscription
		if (supabaseClient) {
			unsubscribeFromJuryUpdates(supabaseClient);
		}
	});
	
	// React to real-time rating updates
	$: if ($ratingsStore.size > 0) {
		// Update local submissions with real-time ratings
		submissions = submissions.map(sub => {
			const realtimeRating = $ratingsStore.get(sub._id);
			if (realtimeRating && realtimeRating.juror_id === user?.id) {
				sub.userRating = {
					rating: realtimeRating.rating,
					comments: realtimeRating.comments,
					updated_at: realtimeRating.updated_at
				};
			}
			return sub;
		});
		filterSubmissions();
	}
	
	// React to real-time stats updates
	$: if ($statsStore.size > 0) {
		// Update local submissions with real-time stats
		submissions = submissions.map(sub => {
			const realtimeStats = $statsStore.get(sub._id);
			if (realtimeStats) {
				sub.stats = {
					average_rating: realtimeStats.average_rating,
					total_ratings: realtimeStats.total_ratings
				};
			}
			return sub;
		});
		filterSubmissions();
	}
	
	async function loadSubmissions(silent = false) {
		if (!silent) loading = true;
		
		try {
			const response = await fetch('/api/jury/submissions');
			if (!response.ok) throw new Error('Failed to load submissions');
			
			const data = await response.json();
			submissions = data.submissions;
			progress = data.progress;
			
			filterSubmissions();
			
			if (!silent) {
				toasts.success(`${submissions.length} Videos geladen`);
			}
		} catch (error) {
			console.error('Failed to load submissions:', error);
			toasts.error('Fehler beim Laden der Einreichungen');
		} finally {
			loading = false;
		}
	}
	
	async function loadStatistics() {
		try {
			const response = await fetch('/api/jury/statistics');
			if (!response.ok) throw new Error('Failed to load statistics');
			
			statistics = await response.json();
		} catch (error) {
			console.error('Failed to load statistics:', error);
		}
	}
	
	function filterSubmissions() {
		filteredSubmissions = submissions;
	}
	
	async function handleRatingUpdate(event: CustomEvent) {
		const { submissionId, rating, comments } = event.detail;
		
		try {
			const submission = submissions.find(s => s._id === submissionId);
			if (!submission) return;
			
			const response = await fetch('/api/jury/submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					submissionId,
					rating,
					comments
				})
			});
			
			if (!response.ok) throw new Error('Failed to save rating');
			
			const result = await response.json();
			
			// Update local state
			submission.userRating = {
				rating,
				comments,
				updated_at: new Date().toISOString()
			};
			
			if (result.stats) {
				submission.stats = result.stats;
			}
			
			// Refresh progress
			await loadSubmissions(true);
			await loadStatistics();
			
			toasts.success('Bewertung gespeichert');
		} catch (error) {
			console.error('Failed to save rating:', error);
			toasts.error('Fehler beim Speichern der Bewertung');
		}
	}
	
	function toggleStats() {
		showStats = !showStats;
	}
	
</script>

<div class="min-h-screen bg-black py-6 px-4 sm:px-6 lg:px-8">
	<div class="container px-6 mx-auto">
		<!-- Header -->
		<div class="mb-6 flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
			<div>
				<h1 class="text-3xl sm:text-4xl font-medium text-white mb-2">Jury Dashboard</h1>
				<p class="text-gray-400">Bewerte die eingereichten Videos für den DJ Award</p>
			</div>
			
			<div class="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
				<button
					on:click={toggleStats}
					class="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-full transition duration-300"
				>
					📊 Statistiken
				</button>
				<button
					on:click={() => viewMode = viewMode === 'grid' ? 'list' : 'grid'}
					class="px-4 sm:px-6 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-full transition duration-300"
				>
					{viewMode === 'grid' ? '📋 Liste' : '⚏ Raster'}
				</button>
				<a
					href="/dashboard"
					class="px-4 sm:px-6 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-full transition duration-300"
				>
					← Dashboard
				</a>
			</div>
		</div>
		
		<!-- Progress Bar -->
		{#if progress}
			<div transition:fade class="mb-6">
				<ProgressTracker {progress} total={submissions.length} />
			</div>
		{/if}
		
		<!-- Main Content -->
		{#if showStats && statistics}
			<div transition:fly={{ y: -20 }} class="mb-8">
				<JuryStats {statistics} on:close={toggleStats} />
			</div>
		{/if}
		
		<!-- Submissions Grid -->
		{#if loading}
			<div class="flex items-center justify-center py-32">
				<div class="text-center">
					<div class="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
					<p class="text-gray-400">Lade Einreichungen...</p>
				</div>
			</div>
		{:else if filteredSubmissions.length === 0}
			<div class="text-center py-32">
				<h2 class="text-2xl font-medium text-white mb-4">Keine Einreichungen</h2>
				<p class="text-gray-400">Es wurden noch keine Videos eingereicht.</p>
			</div>
		{:else}
			<VideoGrid
				submissions={filteredSubmissions}
				{viewMode}
				{isAdmin}
				on:rate={handleRatingUpdate}
			/>
		{/if}
	</div>
</div>