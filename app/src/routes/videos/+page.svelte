<script lang="ts">
  import { useQuery } from '@sanity/svelte-loader';
  import type { PageData } from './$types';
  import type { Video } from '$lib/sanity/queries/videos';
  import SecurePlayer from '$lib/components/video/SecurePlayer.svelte';
  import VideoThumbnail from '$lib/components/video/VideoThumbnail.svelte';
  import { slide } from 'svelte/transition';

  export let data: PageData;
  const videos = useQuery<Video[]>(data.videos);
  const userBadges = data.userBadges;

  interface UserBadge {
    badge_id: string;
    [key: string]: any;
  }

  let selectedVideo: (Video & { hasAccess: boolean }) | null = null;
  let showRequirementsModal = false;
  let currentVideoRequirements: any = null;

  $: groupedVideos = ($videos?.data || []).reduce((acc, video) => {
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

  $: sortedCategories = Object.entries(groupedVideos).sort(([aTitle, aVideos], [bTitle, bVideos]) => {
    const aSortOrder = aVideos[0]?.category?.sortOrder || 0;
    const bSortOrder = bVideos[0]?.category?.sortOrder || 0;
    return aSortOrder - bSortOrder;
  });

  function closeVideo() {
    selectedVideo = null;
  }

  function closeRequirementsModal() {
    showRequirementsModal = false;
    currentVideoRequirements = null;
  }

  function openVideo(video: Video & { hasAccess: boolean }) {
    if (video.hasAccess) {
      selectedVideo = video;
    } else {
      const missingBadges = video.requiredBadges.filter(badge => 
        !userBadges.some((userBadge: UserBadge) => userBadge.badge_id === badge.supabaseId)
      );
      
      currentVideoRequirements = {
        video,
        missingBadges
      };
      showRequirementsModal = true;
    }
  }
</script>

<div class="min-h-screen bg-black text-white p-8">
  <div class="relative z-10 py-12">
    <div class="container px-4 mx-auto">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Video-Bibliothek</span>
       <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">Freischalten. Lernen. Auflegen.</h1>
       <p class="text-2xl text-white/80 mb-8">Sammle Badges, entdecke neue Videos und steige zum DJ-Profi auf</p>
       </div>
   
  

    {#if selectedVideo}
      <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-5xl">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-normal">{selectedVideo.title}</h2>
            <button 
              on:click={closeVideo}
              class="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SecurePlayer
            videoId={selectedVideo._id} 
            title={selectedVideo.title}
            directUrl={selectedVideo.videoFile?.asset?.url || ''}
          />
          {#if selectedVideo.description}
            <p class="mt-4 text-gray-400">{selectedVideo.description}</p>
          {/if}
        </div>
      </div>
    {/if}

    {#if showRequirementsModal}
      <div 
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        transition:slide
      >
        <div class="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-800">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-medium">Video-Zugang</h2>
            <button 
              on:click={closeRequirementsModal}
              class="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center space-x-3 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p class="font-medium">Dieses Video ist noch gesperrt</p>
            </div>

            <p class="text-gray-400">Um „{currentVideoRequirements?.video.title}" ansehen zu können, benötigst du folgende Badges:</p>

            <div class="space-y-3">
              {#each currentVideoRequirements?.missingBadges || [] as badge}
                <div class="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div class="font-medium text-white mb-1">{badge.name}</div>
                  {#if badge.description}
                    <p class="text-sm text-gray-400">{badge.description}</p>
                  {/if}
                </div>
              {/each}
            </div>

            <div class="mt-6 text-sm text-gray-400">
              <p>Vervollständige dein Profil im Dashboard, um Badges freizuschalten.</p>
              <a href="/dashboard" class="mt-4 inline-flex items-center text-green-500 hover:text-green-400">
                Zum Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if sortedCategories.length === 0}
      <p class="text-gray-400">Keine Videos verfügbar.</p>
    {:else}
      {#each sortedCategories as [categoryTitle, videos]}
        <div class="mb-12">
          <div class="flex items-center gap-4 mb-4">
            {#if videos[0]?.category?.icon}
              <img 
                src={videos[0].category.icon.asset.url} 
                alt={categoryTitle}
                class="w-8 h-8 object-contain"
              />
            {/if}
            <h2 class="text-2xl font-medium">{categoryTitle}</h2>
          </div>

          {#if videos[0]?.category?.description}
            <p class="text-gray-400 mb-4">{videos[0].category.description}</p>
          {/if}

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each videos as video}
              <div 
                class="relative rounded-lg overflow-hidden border border-gray-800 bg-gray-900 group cursor-pointer transform transition-all duration-200 hover:scale-[1.02]"
                on:click={() => openVideo(video)}
              >
                <div class="relative">
                  {#if video.thumbnail}
                    <img 
                      src={video.thumbnail.asset.url} 
                      alt={video.title}
                      class="w-full aspect-video object-cover"
                    />
                  {:else}
                    {#if video.videoFile?.asset?.url}
                      <VideoThumbnail 
                        videoUrl={video.videoFile.asset.url} 
                        cacheKey={video._id} 
                      />
                    {:else}
                      <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
                        <span class="text-gray-500">Kein Thumbnail</span>
                      </div>
                    {/if}
                  {/if}

                  {#if !video.hasAccess}
                    <div class="absolute top-2 right-2">
                      <div class="bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Gesperrt</span>
                      </div>
                    </div>
                  {/if}
                </div>

                <div class="p-4">
                  <h3 class="text-lg font-medium mb-2">{video.title}</h3>
                  {#if video.description}
                    <p class="text-gray-400 text-sm">{video.description}</p>
                  {/if}
                </div>

                {#if video.hasAccess}
                  <div 
                    class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div class="bg-green-500 text-black rounded-full p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                      
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
</div>
