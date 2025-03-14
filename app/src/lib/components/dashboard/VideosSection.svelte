<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader';
  import { fade, slide } from 'svelte/transition';
  import type { Video } from '$lib/sanity/queries/videos';
  import SecurePlayer from '$lib/components/video/SecurePlayer.svelte';
  import CollapsibleSection from './CollapsibleSection.svelte';
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  import type { User } from '$lib/types/profile';

  export let videos: any;
  export let user: User;
  export let isOpen = false;

  let videoSection: CollapsibleSection;

  const loadedVideos = useQuery<Video[]>(videos);
  const userBadges = user.badges || [];

  interface UserBadge {
    badge_id: string;
    [key: string]: any;
  }

  let selectedVideo: (Video & { hasAccess: boolean }) | null = null;
  let playerKey = 0; // For forced reload
  let isVideoLoading = false; // Central loading state
  let videoLoadError = false;
  
  // Device detection
  const isMobile = typeof navigator !== 'undefined' ? 
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;

  export function openAndScrollTo() {
    if (videoSection) {
      videoSection.open();
      setTimeout(() => {
        const element = document.getElementById('dj-learning-hub');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  $: groupedVideos = ($loadedVideos?.data || []).reduce((acc, video) => {
    const categoryTitle = video.category?.title || 'Sonstige';
    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }

    // Check user access based on badges
    const hasAccess = !video.requiredBadges?.length || 
      video.requiredBadges.every(badge => 
        userBadges.some((userBadge: UserBadge) => userBadge.badge_id === badge.supabaseId)
      );

    acc[categoryTitle].push({ ...video, hasAccess });
    return acc;
  }, {} as Record<string, Array<Video & { hasAccess: boolean }>>);

  $: totalVideos = Object.values(groupedVideos).flat().length;

  $: sortedCategories = Object.entries(groupedVideos).sort(([aTitle, aVideos], [bTitle, bVideos]) => {
    const aSortOrder = aVideos[0]?.category?.sortOrder || 0;
    const bSortOrder = bVideos[0]?.category?.sortOrder || 0;
    return aSortOrder - bSortOrder;
  });

  function closeVideo() {
    selectedVideo = null;
    playerKey = 0;
    videoLoadError = false;
  }

  function getMissingBadgesText(video: Video & { hasAccess: boolean }): string {
    if (video.hasAccess) return '';
    
    const missingBadges = video.requiredBadges.filter(badge =>
      !userBadges.some((userBadge: UserBadge) => userBadge.badge_id === badge.supabaseId)
    );
    
    const badgesList = missingBadges.map(badge =>
      `${badge.name}${badge.description ? ` - ${badge.description}` : ''}`
    ).join('\n');
    
    return `Um "${video.title}" ansehen zu können, benötigst du folgende Badges:\n\n${badgesList}`;
  }

  function openVideo(video: Video & { hasAccess: boolean }) {
    if (!video.hasAccess) return;
    
    // Reset any previous errors
    videoLoadError = false;
    
    // Start with loading state active
    isVideoLoading = true;
    
    console.log('Opening video:', { 
      isMobile,
      videoId: video._id,
    });

    selectedVideo = video;
    playerKey++;
    
    // Scroll to video player
    setTimeout(() => {
      const videoPlayer = document.querySelector('.video-player-container');
      if (videoPlayer) {
        videoPlayer.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }); 
      }
    }, 100);
  }

  function handleVideoError(event: { detail: { code: number; }; }) {
    console.error('Video error event received:', event.detail);
    
    // Only set error state if we have specific error details
    // For desktop, be more selective about showing errors
    if (!isMobile || (event.detail && event.detail.code && event.detail.code > 1)) {
      videoLoadError = true;
      isVideoLoading = false;
    }
  }

  function handleLoadingStateChange(loading: boolean) {
    console.log('Video loading state changed:', loading);
    isVideoLoading = loading;
  }

  function retryVideo() {
    if (selectedVideo) {
      videoLoadError = false;
      playerKey++;
      isVideoLoading = true;
    }
  }
</script>

<CollapsibleSection 
  title={`DJ Learning Hub (${totalVideos} Videos)`} 
  initiallyOpen={true} 
  id="dj-learning-hub"
  bind:this={videoSection}
>
  <div class="mb-6">
    <p class="text-gray-400">Lerne von erfahrenen DJs und entwickle deine Skills weiter</p>
  </div>

  {#if !sortedCategories.length}
    <p class="text-gray-400">Keine Videos verfügbar.</p>
  {:else}
    <div class="space-y-8">
      {#if selectedVideo}
        <div class="video-player-container w-full bg-gray-900 rounded-lg overflow-hidden relative">
          {#if videoLoadError}
            <div 
              class="absolute inset-0 bg-gray-900/80 grid place-items-center z-20"
              transition:fade={{duration: 150}}
            > 
              <div class="text-center flex flex-col items-center space-y-4 p-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xl font-medium text-white">Video konnte nicht geladen werden</h3>
                <p class="text-gray-300 mb-4">Das Video konnte nicht abgespielt werden. Bitte versuche es später erneut.</p>
                
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button 
                    class="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-medium transition"
                    on:click={retryVideo}
                  >
                    Erneut versuchen
                  </button>
                  
                  <button 
                    class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
                    on:click={closeVideo}
                  >
                    Zurück zur Übersicht
                  </button>
                </div>
              </div>
            </div>
          {/if}
          
          <div class="relative">
            {#key playerKey}
              <!-- Only autoplay on desktop, not on mobile -->
              <SecurePlayer
                videoId={selectedVideo._id}
                title={selectedVideo.title}
                autoplay={!isMobile}
                requireFullscreen={isMobile}
                onLoadingStateChange={handleLoadingStateChange}
                directUrl={selectedVideo.videoFile?.asset?.url || ''}
                on:error={handleVideoError}
              />
            {/key}
          </div>

          <div class="p-2 sm:p-4 space-y-4">
            <div class="flex justify-between items-start">
              <h2 class="text-xs sm:text-base font-medium text-white">{selectedVideo.title}</h2>
              
              <button 
                class="text-gray-400 hover:text-white hidden sm:block"
                on:click={closeVideo}
                aria-label="Schließen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {#if selectedVideo.description}
              <p class="text-gray-400">{selectedVideo.description}</p>
            {/if}
          </div>
        </div>
      {/if}

      {#each sortedCategories as [categoryTitle, videos]}
        <div class="space-y-6">
          <div class="flex items-center gap-4 pb-4 border-b border-gray-800">
            {#if videos[0]?.category?.icon}
              <img 
                src={videos[0].category.icon.asset.url}
                alt={categoryTitle}
                class="w-8 h-8 object-contain"
              />
            {/if}
            <div>
              <h3 class="text-xl font-medium text-white">{categoryTitle}</h3>
              {#if videos[0]?.category?.description}
                <p class="text-gray-400 text-sm mt-1">{videos[0].category.description}</p>
              {/if}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {#each videos as video}
              <button 
                class:ring-2={selectedVideo?._id === video._id} 
                class:ring-green-500={selectedVideo?._id === video._id}
                class="relative rounded-lg overflow-hidden border border-gray-800/40 bg-gray-900 text-white group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] text-left"
                on:click={() => openVideo(video)}
                disabled={!video.hasAccess}
                aria-label={`Video ${video.title} abspielen${!video.hasAccess ? ' (gesperrt)' : ''}`}
              >
                <div class="relative">
                  {#if video.thumbnail}
                    <img 
                      src={video.thumbnail.asset.url} 
                      alt={video.title}
                      class="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  {:else}
                    <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}

                  {#if !video.hasAccess}
                    <div class="absolute top-2 right-2">
                      <div class="flex items-center gap-1">
                        <div class="bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Gesperrt</span>
                          <InfoIcon variant="default" text={getMissingBadgesText(video)} position="left" size="sm" />
                        </div>
                      </div>
                    </div>
                  {/if}
                  
                  <!-- Duration badge (would need to be added to your data model) -->
                  {#if video.duration}
                    <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  {/if}
                </div>

                <div class="p-3">
                  <h4 class="font-medium mb-1 line-clamp-2">{video.title}</h4>
                  {#if video.description}
                    <p class="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                  {/if}
                </div>

                {#if video.hasAccess}
                  <div 
                    class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <!-- Show different states based on loading/selected -->
                    {#if isVideoLoading && selectedVideo?._id === video._id}
                      <div class="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent"></div>
                    {:else if selectedVideo?._id === video._id}
                      <div class="bg-white text-green-500 rounded-full p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    {:else}
                      <div class=" text-green-500 ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                          <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                        </svg>
                        
                      </div>
                    {/if}
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</CollapsibleSection>