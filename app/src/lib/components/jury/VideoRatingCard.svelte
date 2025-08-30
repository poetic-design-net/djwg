<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import RatingInterface from './RatingInterface.svelte';
	import SecurePlayer from '$lib/components/video/SecurePlayer.svelte';
	
	export let submission: any;
	export let viewMode: 'grid' | 'list' = 'grid';
	
	const dispatch = createEventDispatcher();
	
	let showVideo = false;
	let showRating = false;
	let comments = submission.userRating?.comments || '';
	
	function toggleVideo() {
		showVideo = !showVideo;
	}
	
	function toggleRating() {
		showRating = !showRating;
	}
	
	function handleRating(event: CustomEvent) {
		dispatch('rate', {
			rating: event.detail,
			comments
		});
		showRating = false;
	}
	
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-yellow-500/20 text-yellow-300';
			case 'reviewed': return 'bg-blue-500/20 text-blue-300';
			case 'accepted': return 'bg-green-500/20 text-green-300';
			default: return 'bg-gray-500/20 text-gray-300';
		}
	}
</script>

<div class="bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all duration-300 overflow-hidden">
	<!-- Header -->
	<div class="p-4 border-b border-gray-700">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<h3 class="text-lg font-medium text-white mb-1">
					{submission.userName}
				</h3>
				<span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
					{submission.status}
				</span>
			</div>
			
			{#if submission.winner}
				<span class="text-3xl" title="Gewinner">🏆</span>
			{/if}
		</div>
	</div>
	
	<!-- Content -->
	<div class="p-4 space-y-4">
		<!-- Statistics -->
		{#if submission.stats && submission.stats.total_ratings > 0}
			<div class="bg-gray-900/50 rounded-lg p-3">
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>
						<span class="text-gray-400">Durchschnitt:</span>
						<span class="text-white font-medium ml-1">
							{submission.stats.average_rating}/10
						</span>
					</div>
					<div>
						<span class="text-gray-400">Bewertungen:</span>
						<span class="text-white font-medium ml-1">
							{submission.stats.total_ratings}
						</span>
					</div>
				</div>
			</div>
		{/if}
		
		<!-- User's Rating -->
		{#if submission.userRating}
			<div class="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
				<div class="flex items-center justify-between">
					<span class="text-sm text-green-400">Deine Bewertung:</span>
					<div class="flex items-center space-x-2">
						<span class="text-xl font-medium text-white">
							{submission.userRating.rating}/10
						</span>
						<span class="text-yellow-400">⭐</span>
					</div>
				</div>
				{#if submission.userRating.comments}
					<p class="text-xs text-gray-400 mt-2 italic">
						"{submission.userRating.comments}"
					</p>
				{/if}
				<p class="text-xs text-gray-500 mt-1">
					Aktualisiert: {formatDate(submission.userRating.updated_at)}
				</p>
			</div>
		{/if}
		
		<!-- Actions -->
		<div class="flex space-x-2">
			<button
				on:click={toggleVideo}
				class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition flex items-center justify-center space-x-2 text-sm font-medium"
			>
				<span>{showVideo ? '🎬' : '▶️'}</span>
				<span>Video ansehen</span>
			</button>
			
			<button
				on:click={toggleRating}
				class="flex-1 px-4 py-2 bg-green-500 text-black rounded-full hover:bg-green-400 transition flex items-center justify-center space-x-2 text-sm font-medium"
			>
				<span>⭐</span>
				<span>{submission.userRating ? 'Anpassen' : 'Bewerten'}</span>
			</button>
		</div>
		
		<!-- Video Player -->
		{#if showVideo}
			<div transition:fade class="mt-4">
				{#if submission.fileUrl}
					<SecurePlayer
						videoId={submission._id}
						title={submission.userName}
						autoplay={false}
						requireFullscreen={false}
						directUrl={submission.fileUrl}
					/>
				{:else}
					<div class="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
						<p class="text-gray-400">Video nicht verfügbar</p>
					</div>
				{/if}
			</div>
		{/if}
		
		<!-- Rating Interface -->
		{#if showRating}
			<div transition:fade class="mt-4 space-y-4">
				<RatingInterface 
					value={submission.userRating?.rating || 5}
					on:rate={handleRating}
				/>
				
				<div>
					<label for="comments-{submission._id}" class="block text-sm text-gray-400 mb-2">
						Kommentar (optional)
					</label>
					<textarea
						id="comments-{submission._id}"
						bind:value={comments}
						placeholder="Füge dein Feedback hinzu..."
						class="w-full px-3 py-2 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none resize-none"
						rows="3"
					></textarea>
				</div>
				
				<div class="flex space-x-2">
					<button
						on:click={() => showRating = false}
						class="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
					>
						Abbrechen
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>