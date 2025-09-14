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
	let selectedMedia: string | null = null;
	
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
</script>

<div class="bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-all duration-300 overflow-hidden">
	<!-- Header -->
	<div class="p-3 sm:p-4 border-b border-gray-700">
		<div class="flex items-start gap-3 sm:gap-4">
			<!-- Avatar -->
			<div class="relative flex-shrink-0">
				<div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-400 via-purple-500 to-pink-500 p-0.5">
					<div class="w-full h-full rounded-full bg-gray-900 p-0.5">
						{#if groupedFiles.profilePhoto?.imageUrl || groupedFiles.profilePhoto?.fileUrl}
							<img 
								src={groupedFiles.profilePhoto.imageUrl || groupedFiles.profilePhoto.fileUrl}
								alt={submission.userName}
								class="w-full h-full rounded-full object-cover"
							/>
						{:else}
							<div class="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
								<span class="text-lg sm:text-2xl font-medium text-gray-400">
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
			<div class="flex-1 min-w-0">
				<h3 class="text-base sm:text-lg font-medium text-white mb-1 truncate">
					{submission.userName}
				</h3>
				<p class="text-xs sm:text-sm text-gray-400 truncate">{submission.userEmail}</p>
				<div class="flex items-center gap-2 flex-wrap text-xs text-gray-500 mt-2">
					<span class={`whitespace-nowrap ${groupedFiles.mainVideo || groupedFiles.introVideo ? 'text-green-400' : 'text-gray-500'}`}>
						{groupedFiles.mainVideo || groupedFiles.introVideo ? '✓' : '✗'} Video
					</span>
					<span class="hidden sm:inline">·</span>
					<span class={`whitespace-nowrap ${groupedFiles.profilePhoto ? 'text-green-400' : 'text-gray-500'}`}>
						{groupedFiles.profilePhoto ? '✓' : '✗'} Profil
					</span>
					<span class="hidden sm:inline">·</span>
					<span class={`whitespace-nowrap ${groupedFiles.setupPhoto ? 'text-green-400' : 'text-gray-500'}`}>
						{groupedFiles.setupPhoto ? '✓' : '✗'} Setup
					</span>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Content -->
	<div class="p-3 sm:p-4 space-y-3 sm:space-y-4">
		<!-- Media Gallery - Scrollable for multiple files -->
		{#if groupedFiles.allFiles && groupedFiles.allFiles.length > 0}
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<p class="text-xs text-gray-400">
						{groupedFiles.allFiles.length} {groupedFiles.allFiles.length === 1 ? 'Datei' : 'Dateien'} hochgeladen
					</p>
					{#if groupedFiles.allFiles.length > 3}
						<p class="text-xs text-green-400">← Scrollen →</p>
					{/if}
				</div>
				<div class="overflow-x-auto">
					<div class="flex gap-2 pb-2" style="min-width: fit-content;">
						{#each groupedFiles.allFiles as file, index}
							<button
								on:click={() => selectedMedia = `file-${index}`}
								class="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-900 rounded overflow-hidden hover:ring-2 hover:ring-green-500 transition"
								title="{file.fileName}"
							>
								{#if file.fileType?.startsWith('video/')}
									<div class="absolute inset-0 flex items-center justify-center">
										<span class="text-2xl">🎬</span>
									</div>
								{:else if file.fileType?.startsWith('image/')}
									<img 
										src={file.imageUrl || file.fileUrl}
										alt={file.fileName}
										class="w-full h-full object-cover"
										loading="lazy"
									/>
								{:else}
									<div class="absolute inset-0 flex items-center justify-center">
										<span class="text-2xl">📄</span>
									</div>
								{/if}
								
								<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-1">
									<p class="text-[10px] text-white truncate">
										{file.fileName?.split('/').pop() || `Datei ${index + 1}`}
									</p>
									<p class="text-[9px] text-gray-300">
										{file.fileType?.startsWith('video/') ? 'Video' : 
										 file.fileType?.startsWith('image/') ? 'Bild' : 'Datei'}
									</p>
								</div>
								
								{#if index === 0}
									<span class="absolute top-1 left-1 bg-green-500 text-black text-[10px] px-1 rounded">Haupt</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<!-- Fallback for old single-file structure -->
			<div class="grid grid-cols-3 gap-1.5 sm:gap-2">
				<!-- Single Video/Image Preview -->
				<div class="relative aspect-square bg-gray-900 rounded overflow-hidden">
					{#if submission.fileType?.startsWith('video/')}
						<button
							on:click={() => selectedMedia = 'single'}
							class="w-full h-full hover:ring-2 hover:ring-green-500 transition"
						>
							<div class="absolute inset-0 flex items-center justify-center">
								<span class="text-2xl">🎬</span>
							</div>
						</button>
					{:else if submission.fileType?.startsWith('image/')}
						<img 
							src={submission.imageUrl || submission.fileUrl}
							alt={submission.fileName}
							class="w-full h-full object-cover"
						/>
					{/if}
				</div>
			</div>
		{/if}
		
		<!-- Statistics -->
		{#if submission.stats && submission.stats.total_ratings > 0}
			<div class="bg-gray-900/50 rounded-lg p-2.5 sm:p-3">
				<div class="grid grid-cols-2 gap-2 text-xs sm:text-sm">
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
			<div class="bg-green-500/10 rounded-lg p-2.5 sm:p-3 border border-green-500/30">
				<div class="flex items-center justify-between">
					<span class="text-xs sm:text-sm text-green-400">Deine Bewertung:</span>
					<div class="flex items-center space-x-1.5 sm:space-x-2">
						<span class="text-lg sm:text-xl font-medium text-white">
							{submission.userRating.rating}/10
						</span>
						<span class="text-yellow-400">⭐</span>
					</div>
				</div>
				{#if submission.userRating.comments}
					<p class="text-xs text-gray-400 mt-2 italic line-clamp-2">
						"{submission.userRating.comments}"
					</p>
				{/if}
				<p class="text-[10px] sm:text-xs text-gray-500 mt-1">
					Aktualisiert: {formatDate(submission.userRating.updated_at)}
				</p>
			</div>
		{/if}
		
		<!-- Actions -->
		<div class="flex justify-center">
			<button
				on:click={toggleRating}
				class="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-500 text-black rounded-full hover:bg-green-400 transition flex items-center justify-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-medium"
			>
				<span>⭐</span>
				<span>{submission.userRating ? 'Anpassen' : 'Bewerten'}</span>
			</button>
		</div>
		
		<!-- Selected Media Display -->
		{#if selectedMedia}
			{@const fileIndex = selectedMedia.startsWith('file-') ? parseInt(selectedMedia.split('-')[1]) : -1}
			{@const selectedFile = fileIndex >= 0 ? groupedFiles.allFiles?.[fileIndex] : null}
			<div transition:fade class="mt-4">
				
				{#if selectedFile}
					<div class="space-y-2">
						<p class="text-sm text-gray-400">{selectedFile.fileName?.split('/').pop() || 'Datei'}</p>
						{#if selectedFile.fileType?.startsWith('video/')}
							<SecurePlayer
								videoId={selectedFile._id || `${submission._id}-video-${fileIndex}`}
								title={`${submission.userName} - ${selectedFile.fileName || 'Video'}`}
								autoplay={false}
								requireFullscreen={false}
								directUrl={selectedFile.fileUrl}
							/>
						{:else if selectedFile.fileType?.startsWith('image/')}
							<img 
								src={selectedFile.imageUrl || selectedFile.fileUrl}
								alt={selectedFile.fileName}
								class="w-full rounded-lg"
							/>
						{:else}
							<div class="bg-gray-900 rounded-lg p-8 text-center">
								<p class="text-gray-400">Datei-Vorschau nicht verfügbar</p>
								<p class="text-sm text-gray-500 mt-2">{selectedFile.fileType}</p>
							</div>
						{/if}
					</div>
				{:else if selectedMedia === 'single'}
					<!-- Fallback for single file -->
					<div class="space-y-2">
						<p class="text-sm text-gray-400">{submission.fileName || 'Datei'}</p>
						{#if submission.fileType?.startsWith('video/')}
							<SecurePlayer
								videoId={submission._id}
								title={submission.userName + ' - Video'}
								autoplay={false}
								requireFullscreen={false}
								directUrl={submission.fileUrl}
							/>
						{:else if submission.fileType?.startsWith('image/')}
							<img 
								src={submission.imageUrl || submission.fileUrl}
								alt={submission.fileName}
								class="w-full rounded-lg"
							/>
						{/if}
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