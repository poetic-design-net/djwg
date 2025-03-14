<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  export let videoId: string;
  export let title: string;
  export let directUrl: string = '';
  export let autoplay: boolean = false;
  export let requireFullscreen: boolean = false;
  export let onLoadingStateChange: (isLoading: boolean) => void = () => {};
  
  interface HTMLVideoElementWithWebkit extends HTMLVideoElement {
    webkitEnterFullscreen?: () => Promise<void>;
    webkitSupportsFullscreen?: boolean;
    webkitDisplayingFullscreen?: boolean;
  }
  
  const dispatch = createEventDispatcher();
  let videoElement: HTMLVideoElementWithWebkit;
  let playerContainer: HTMLDivElement;
  let videoUrl = '';
  let isLoaded = false;
  let isPlaying = false;
  let showControls = true;
  let controlsTimeout: ReturnType<typeof setTimeout>;
  let progress = 0;
  let volume = 1;
  let currentTime = '0:00';
  let duration = '0:00';
  let isLoading = true;
  let hasError = false;
  let loadingTimeout: ReturnType<typeof setTimeout>;
  let isMobile = false;
  
  onMount(() => {
    if (!browser) return;
    
    // Signal loading state immediately
    onLoadingStateChange(true);
    isLoading = true;
    
    // Set a timeout for loading - if video doesn't load after 10 seconds, show error
    loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.error('Video loading timeout');
        hasError = true;
        isLoading = false;
        onLoadingStateChange(false);
        dispatch('error', { message: 'Loading timeout' });
      }
    }, 10000);
    
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    videoUrl = directUrl || `/api/videos/${videoId}/stream`;
    
    console.log('Player initialization:', {
      isMobile,
      autoplay,
      requireFullscreen,
      videoUrl
    });
  });

  function setupVideoListeners() {
    if (!videoElement) return;
    
    // Loading events
    videoElement.addEventListener('loadstart', () => {
      console.log('Video loadstart event');
      isLoading = true;
      onLoadingStateChange(true);
    });
    
    videoElement.addEventListener('loadeddata', handleVideoLoaded);
    
    // Error handling
    videoElement.addEventListener('error', (e) => {
      console.error('Video error event:', e);
      clearTimeout(loadingTimeout);
      hasError = true;
      isLoading = false;
      onLoadingStateChange(false);
      dispatch('error', { event: e });
    });
    
    // Stalled/waiting events
    videoElement.addEventListener('stalled', () => {
      console.log('Video stalled event');
      isLoading = true;
      onLoadingStateChange(true);
    });
    
    videoElement.addEventListener('waiting', () => {
      console.log('Video waiting event');
      isLoading = true;
      onLoadingStateChange(true);
    });
    
    // Progress events
    videoElement.addEventListener('progress', () => {
      if (isLoading && videoElement.readyState >= 3) {
        isLoading = false;
        onLoadingStateChange(false);
      }
    });
    
    videoElement.addEventListener('canplay', () => {
      console.log('Video canplay event');
      isLoading = false;
      onLoadingStateChange(false);
    });
    
    videoElement.addEventListener('playing', () => {
      console.log('Video playing event');
      isLoading = false;
      onLoadingStateChange(false);
      isPlaying = true;
    });
    
    videoElement.addEventListener('pause', () => {
      isPlaying = false;
    });
    
    // Mobile-specific setup
    if (isMobile) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
  }
  
  function handleVideoLoaded() {
    console.log('Video loaded successfully');
    clearTimeout(loadingTimeout);
    isLoaded = true;
    isLoading = false;
    onLoadingStateChange(false);
    
    if (autoplay) {
      attemptAutoplay();
    }
  }
  
  async function attemptAutoplay() {
    if (!videoElement || !isLoaded) return;
    
    try {
      console.log('Attempting autoplay');
      // Try with muted first (better chance on mobile)
      videoElement.muted = true;
      await videoElement.play();
      
      // If successful and originally not muted, unmute
      if (volume > 0) {
        videoElement.muted = false;
        videoElement.volume = volume;
      }
      
      isPlaying = true;
      console.log('Autoplay successful');
      
      // For mobile, try fullscreen if required
      if (requireFullscreen && isMobile) {
        setTimeout(enterFullscreen, 300);
      }
    } catch (err) {
      console.error('Autoplay error:', err);
      // Reset muted state if autoplay failed
      videoElement.muted = false;
      isPlaying = false;
    }
  }
  
  async function enterFullscreen() {
    if (!videoElement || !playerContainer) return;
    
    try {
      if (videoElement.webkitEnterFullscreen) {
        console.log('Attempting iOS native fullscreen');
        await videoElement.webkitEnterFullscreen();
      } else if (playerContainer.requestFullscreen) {
        console.log('Attempting standard fullscreen');
        await playerContainer.requestFullscreen();
      } else if ((document as any).webkitRequestFullscreen) {
        console.log('Attempting webkit fullscreen');
        await (playerContainer as any).webkitRequestFullscreen();
      }
      console.log('Fullscreen activated');
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }
  
  function handleFullscreenChange() {
    const isFullscreen = 
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (videoElement && videoElement.webkitDisplayingFullscreen);
      
    console.log('Fullscreen change:', { isFullscreen });
  }

  function handleMouseMove() {
    showControls = true;
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) showControls = false;
    }, 2000);
  }

  function formatTime(seconds: number) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleTimeUpdate() {
    if (!videoElement) return;
    
    progress = videoElement.duration > 0 
      ? (videoElement.currentTime / videoElement.duration) * 100 
      : 0;
    
    currentTime = formatTime(videoElement.currentTime);
    duration = formatTime(videoElement.duration);
  }

  function handlePlayPause() {
    if (!videoElement || !isLoaded) return;
    
    if (videoElement.paused) {
      videoElement.play().then(() => {
        isPlaying = true;
      }).catch((err) => {
        console.error('Play error:', err);
        // For mobile, user interaction might be needed first
        if (isMobile) {
          enterFullscreen();
        }
      });
    } else {
      videoElement.pause();
      isPlaying = false;
    }
  }
  
  // Separated click handler to use for both video and play button
  function handleClick() {
    if (isMobile && requireFullscreen) {
      // On mobile with fullscreen requirement, prioritize entering fullscreen
      enterFullscreen();
    }
    handlePlayPause();
  }

  function handleSeek(e: MouseEvent) {
    if (!videoElement || !playerContainer || !isLoaded) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * videoElement.duration;
    
    if (isFinite(newTime) && newTime >= 0 && newTime <= videoElement.duration) {
      videoElement.currentTime = newTime;
    }
  }

  function updateVolume(e: Event) {
    if (!videoElement) return;
    const input = e.target as HTMLInputElement;
    volume = parseFloat(input.value);
    videoElement.volume = volume;
  }

  onDestroy(() => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (loadingTimeout) clearTimeout(loadingTimeout);
    
    // Remove mobile-specific listeners
    if (isMobile) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
    
    // If we still have a video element, stop it
    if (videoElement) {
      videoElement.pause();
      videoElement.src = '';
      videoElement.load();
    }
  });
</script>

<div 
  class="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
  bind:this={playerContainer}
  on:mousemove={handleMouseMove}
  on:mouseleave={() => showControls = false}
>
  <!-- Loading Indicator -->
  {#if isLoading}
    <div class="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent mb-4"></div>
        <span class="text-white text-sm">Video wird geladen...</span>
      </div>
    </div>
  {/if}
  
  <!-- Error Message -->
  {#if hasError}
    <div class="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
      <div class="text-center max-w-md mx-auto p-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-white text-lg font-medium mb-2">Fehler beim Laden des Videos</h3>
        <p class="text-gray-300 mb-4">Das Video konnte nicht abgespielt werden. Bitte versuche es später erneut.</p>
        <button 
          class="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg transition"
          on:click={() => window.location.reload()}
        >
          Neu laden
        </button>
      </div>
    </div>
  {/if}

  <!-- The Video -->
  <video
    bind:this={videoElement}
    class="w-full h-full"
    preload="auto"
    playsInline
    on:loadedmetadata={setupVideoListeners}
    on:click={handleClick}
    on:timeupdate={handleTimeUpdate}
    poster={!videoUrl ? undefined : null}
  >
    {#if videoUrl}
      <source src={videoUrl} type="video/mp4">
    {/if}
    <p class="text-center p-4 text-white">Ihr Browser unterstützt keine Video-Wiedergabe.</p>
  </video>

  <!-- Play Button for Mobile (always visible to help with playback) -->
  {#if isMobile && !isPlaying && isLoaded && !hasError}
    <button
      class="absolute inset-0 flex items-center justify-center bg-black/40 z-5"
      on:click={handleClick}
      aria-label="Video abspielen"
    >
      <div class="bg-green-500 text-black rounded-full p-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </button>
  {/if}

  <!-- Custom Controls for Desktop -->
  {#if !requireFullscreen || !isMobile}
    <div 
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300"
      class:opacity-0={!showControls}
      class:pointer-events-none={!showControls || !isLoaded}
    >
      <!-- Progress Bar -->
      <div 
        class="w-full h-1 bg-gray-600 mb-4 rounded-full overflow-hidden cursor-pointer"
        on:click={handleSeek}
      >
        <div 
          class="h-full bg-green-500 transition-all duration-100"
          style="width: {progress}%"
        />
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Play/Pause -->
          <button
            class="text-white hover:text-green-500 transition-colors"
            on:click={handlePlayPause}
            disabled={!isLoaded}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {#if isPlaying}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
            {/if}
          </button>

          <!-- Volume -->
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              on:input={updateVolume}
              class="w-20 accent-green-500"
              aria-label="Volume"
            />
          </div>

          <!-- Time -->
          <div class="text-white text-sm">
            {currentTime} / {duration}
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-white text-sm hidden md:block">{title}</span>
        </div>
      </div>
    </div>
  {/if}
</div>