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
  let playerKey = 0; // Für erzwungenes Neuladen
  let isVideoLoading = false;

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
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log('Video wird geöffnet:', { 
      isMobile, 
      userAgent: navigator.userAgent,
      videoId: video._id,
      isVideoLoading
    });

    selectedVideo = video;
    playerKey++;
    
    // Scroll zum Video
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

  function handleVideoError(e: Event) {
    console.error('Video loading error:', { 
      event: e,
      videoId: selectedVideo?._id
    });
    console.error('Video konnte nicht abgespielt werden');
  }

  function handleLoadingStateChange(loading: boolean) {
    isVideoLoading = loading; // Nur ein Loading-State für beide Komponenten
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
          {#if isVideoLoading} <!-- Gemeinsamer Loading-State -->
            <div 
              class="absolute inset-0 bg-gray-900/80 grid place-items-center z-20"
              transition:fade={{duration: 150}}
            > 
              <div class="text-center flex flex-col items-center space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent mb-4"></div>
                <span class="text-gray-300 text-center">Video wird geladen...</span>
              </div>
            </div>
          {/if}
          {#key playerKey}
            <SecurePlayer
              videoId={selectedVideo._id}
              title={selectedVideo.title}
              autoplay={true}
              requireFullscreen={/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)}
              onLoadingStateChange={handleLoadingStateChange}
              directUrl={selectedVideo.videoFile?.asset?.url || ''}
              on:error={handleVideoError}
            />
          {/key}

          <div class="p-4 space-y-4">
            <h2 class="text-xl font-medium text-white">{selectedVideo.title}</h2>
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
                class:ring-2={selectedVideo?._id === video._id} class:ring-green-500={selectedVideo?._id === video._id}
                class="relative rounded-lg overflow-hidden border border-gray-800/40 bg-gray-900 text-white group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] text-left"
                on:click={() => openVideo(video)}
                disabled={!video.hasAccess}
              >
                <div class="relative">
                  {#if video.thumbnail}
                    <img 
                      src={video.thumbnail.asset.url} 
                      alt={video.title}
                      class="w-full aspect-video object-cover"
                    />
                  {:else}
                    <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
                      <span class="text-gray-500">Kein Thumbnail</span>
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
                    <!-- Loading Icon bei Videoladevorgang -->
                    {#if isVideoLoading && selectedVideo?._id === video._id}
                      <div class="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent"></div>
                    <!-- Play Icon wenn nicht ausgewählt -->
                    {:else}
                      <div class="bg-green-500 text-black rounded-full p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
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