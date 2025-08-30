<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import RatingInterface from './RatingInterface.svelte';
	import SecurePlayer from '$lib/components/video/SecurePlayer.svelte';
	
	export let submission: any;
	export let viewMode: 'grid' | 'list' = 'grid';
	export let isAdmin: boolean = false;
	
	const dispatch = createEventDispatcher();
	
	let showRating = false;
	let comments = submission.userRating?.comments || '';
	let selectedMedia: 'mainVideo' | 'introVideo' | 'profilePhoto' | 'setupPhoto' | null = null;
	let currentStatus = submission.status || 'pending';
	
	const statusOptions = [
		{ value: 'pending', label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-300' },
		{ value: 'reviewed', label: 'Überprüft', color: 'bg-blue-500/20 text-blue-300' },
		{ value: 'accepted', label: 'Akzeptiert', color: 'bg-green-500/20 text-green-300' },
		{ value: 'rejected', label: 'Abgelehnt', color: 'bg-red-500/20 text-red-300' }
	];
	
	// Gruppiere die Dateien nach Typ
	$: groupedFiles = groupSubmissionFiles(submission);
	
	function groupSubmissionFiles(sub: any) {
		if (!sub.files || !Array.isArray(sub.files)) {
			// Fallback für einzelne Submission
			return {
				mainVideo: sub.fileType?.startsWith('video/') ? sub : null,
				introVideo: null,
				profilePhoto: sub.fileType?.startsWith('image/') ? sub : null,
				setupPhoto: null,
				allFiles: [sub]
			};
		}
		
		// Gruppiere multiple Dateien
		const videos = sub.files.filter((f: any) => f.fileType?.startsWith('video/'));
		const images = sub.files.filter((f: any) => f.fileType?.startsWith('image/'));
		
		return {
			mainVideo: videos.find((v: any) => v.fileName?.toLowerCase().includes('mix')) || videos[0],
			introVideo: videos.find((v: any) => v.fileName?.toLowerCase().includes('vorstell') || v.fileName?.toLowerCase().includes('intro')) || videos[1],
			profilePhoto: images.find((img: any) => img.fileName?.toLowerCase().includes('profil') || img.fileName?.toLowerCase().includes('foto')) || images[0],
			setupPhoto: images.find((img: any) => img.fileName?.toLowerCase().includes('setup') || img.fileName?.toLowerCase().includes('dj')) || images[1],
			allFiles: sub.files
		};
	}
	
	function toggleRating() {
		showRating = !showRating;
	}
	
	function handleStatusChange(newStatus: string) {
		currentStatus = newStatus;
		dispatch('statusChange', { status: newStatus });
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
		const option = statusOptions.find(opt => opt.value === status);
		return option?.color || 'bg-gray-500/20 text-gray-300';
	}
</script>

<div class="bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all duration-300 overflow-hidden">
	<!-- Header -->
	<div class="p-4 border-b border-gray-700">
		<div class="flex items-start gap-4">
			<!-- Avatar -->
			<div class="relative flex-shrink-0">
				<div class="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 via-purple-500 to-pink-500 p-0.5">
					<div class="w-full h-full rounded-full bg-gray-900 p-0.5">
						{#if groupedFiles.profilePhoto?.imageUrl || groupedFiles.profilePhoto?.fileUrl}
							<img 
								src={groupedFiles.profilePhoto.imageUrl || groupedFiles.profilePhoto.fileUrl}
								alt={submission.userName}
								class="w-full h-full rounded-full object-cover"
							/>
						{:else}
							<div class="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
								<span class="text-2xl font-medium text-gray-400">
									{submission.userName?.charAt(0)?.toUpperCase() || '👤'}
								</span>
							</div>
						{/if}
					</div>
				</div>
				{#if submission.winner || submission.isWinner}
					<span class="absolute -top-1 -right-1 text-xl" title="Gewinner">🏆</span>
				{/if}
			</div>
			
			<!-- User Info -->
			<div class="flex-1">
				<h3 class="text-lg font-medium text-white mb-1">
					{submission.userName}
				</h3>
				<p class="text-sm text-gray-400">{submission.userEmail}</p>
				<div class="flex items-center gap-2 mt-2">
					{#if isAdmin}
						<select
							bind:value={currentStatus}
							on:change={() => handleStatusChange(currentStatus)}
							class="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-white border border-gray-600 hover:border-gray-500 focus:outline-none focus:border-green-500 cursor-pointer"
						>
							{#each statusOptions as option}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					{:else}
						<span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
							{statusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}
						</span>
					{/if}
					<span class="text-xs text-gray-500">
						<span class={groupedFiles.mainVideo || groupedFiles.introVideo ? 'text-green-400' : 'text-gray-500'}>
							{groupedFiles.mainVideo || groupedFiles.introVideo ? '✓' : '✗'} Video
						</span>
						· 
						<span class={groupedFiles.profilePhoto ? 'text-green-400' : 'text-gray-500'}>
							{groupedFiles.profilePhoto ? '✓' : '✗'} Profil
						</span>
						· 
						<span class={groupedFiles.setupPhoto ? 'text-green-400' : 'text-gray-500'}>
							{groupedFiles.setupPhoto ? '✓' : '✗'} Setup
						</span>
					</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Content -->
	<div class="p-4 space-y-4">
		<!-- Quick Preview - 3 Columns -->
		<div class="grid grid-cols-3 gap-2">
			<!-- Video Preview (DJ Mix or Intro) -->
			{#if groupedFiles.mainVideo || groupedFiles.introVideo}
				<button
					on:click={() => selectedMedia = groupedFiles.mainVideo ? 'mainVideo' : 'introVideo'}
					class="relative aspect-square bg-gray-900 rounded overflow-hidden hover:ring-2 hover:ring-green-500 transition"
					title="Video ansehen"
				>
					<div class="absolute inset-0 flex items-center justify-center">
						<span class="text-2xl">🎬</span>
					</div>
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
						<p class="text-xs text-white truncate">Video</p>
					</div>
				</button>
			{:else}
				<div class="aspect-square bg-gray-900/50 rounded flex items-center justify-center">
					<span class="text-gray-600">🎬</span>
				</div>
			{/if}
			
			<!-- Profile Photo Preview -->
			{#if groupedFiles.profilePhoto}
				<button
					on:click={() => selectedMedia = 'profilePhoto'}
					class="relative aspect-square bg-gray-900 rounded overflow-hidden hover:ring-2 hover:ring-green-500 transition"
					title="Profil-Foto ansehen"
				>
					{#if groupedFiles.profilePhoto.imageUrl || groupedFiles.profilePhoto.fileUrl}
						<img 
							src={groupedFiles.profilePhoto.imageUrl || groupedFiles.profilePhoto.fileUrl}
							alt="Profil"
							class="w-full h-full object-cover"
						/>
					{:else}
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-2xl">👤</span>
						</div>
					{/if}
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
						<p class="text-xs text-white truncate">Profil</p>
					</div>
				</button>
			{:else}
				<div class="aspect-square bg-gray-900/50 rounded flex items-center justify-center">
					<span class="text-gray-600">👤</span>
				</div>
			{/if}
			
			<!-- Setup Photo Preview -->
			{#if groupedFiles.setupPhoto}
				<button
					on:click={() => selectedMedia = 'setupPhoto'}
					class="relative aspect-square bg-gray-900 rounded overflow-hidden hover:ring-2 hover:ring-green-500 transition"
					title="DJ Setup ansehen"
				>
					{#if groupedFiles.setupPhoto.imageUrl || groupedFiles.setupPhoto.fileUrl}
						<img 
							src={groupedFiles.setupPhoto.imageUrl || groupedFiles.setupPhoto.fileUrl}
							alt="Setup"
							class="w-full h-full object-cover"
						/>
					{:else}
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-2xl">🎛️</span>
						</div>
					{/if}
					<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
						<p class="text-xs text-white truncate">Setup</p>
					</div>
				</button>
			{:else}
				<div class="aspect-square bg-gray-900/50 rounded flex items-center justify-center">
					<span class="text-gray-600">🎛️</span>
				</div>
			{/if}
		</div>
		
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
		<div class="flex justify-center">
			<button
				on:click={toggleRating}
				class="px-6 py-2 bg-green-500 text-black rounded-full hover:bg-green-400 transition flex items-center justify-center space-x-2 text-sm font-medium"
			>
				<span>⭐</span>
				<span>{submission.userRating ? 'Anpassen' : 'Bewerten'}</span>
			</button>
		</div>
		
		<!-- Selected Media Display -->
		{#if selectedMedia}
			<div transition:fade class="mt-4">
				{#if (selectedMedia === 'mainVideo' || selectedMedia === 'introVideo') && (groupedFiles.mainVideo || groupedFiles.introVideo)}
					<div class="space-y-2">
						<p class="text-sm text-gray-400">Video (DJ Mix mit Vorstellung)</p>
						<SecurePlayer
							videoId={(groupedFiles.mainVideo || groupedFiles.introVideo)._id || submission._id + '-video'}
							title={submission.userName + ' - Video'}
							autoplay={false}
							requireFullscreen={false}
							directUrl={(groupedFiles.mainVideo || groupedFiles.introVideo).fileUrl}
						/>
					</div>
				{:else if selectedMedia === 'profilePhoto' && groupedFiles.profilePhoto}
					<div class="space-y-2">
						<p class="text-sm text-gray-400">Profil-Foto</p>
						<img 
							src={groupedFiles.profilePhoto.imageUrl || groupedFiles.profilePhoto.fileUrl}
							alt="Profil-Foto"
							class="w-full rounded-lg"
						/>
					</div>
				{:else if selectedMedia === 'setupPhoto' && groupedFiles.setupPhoto}
					<div class="space-y-2">
						<p class="text-sm text-gray-400">DJ Setup</p>
						<img 
							src={groupedFiles.setupPhoto.imageUrl || groupedFiles.setupPhoto.fileUrl}
							alt="DJ Setup"
							class="w-full rounded-lg"
						/>
					</div>
				{/if}
				<button
					on:click={() => selectedMedia = null}
					class="mt-2 text-sm text-gray-400 hover:text-gray-300"
				>
					Schließen
				</button>
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