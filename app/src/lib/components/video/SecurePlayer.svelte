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
  let controlsTimeout: ReturnType<typeof setTimeout> | null = null;
  let progress = 0;
  let volume = 1;
  let currentTime = '0:00';
  let duration = '0:00';
  let isLoading = true;
  let hasError = false;
  let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
  let isMobile = false;
  let isFullscreen = false;
  
  // For mobile-specific behavior
  let needsUserInteraction = false;
  let userInteracted = false;
  
  onMount(() => {
    if (!browser) return;
    
    // Signal loading state immediately
    onLoadingStateChange(true);
    isLoading = true;
    
    // Detect mobile device
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // Set video URL
    videoUrl = directUrl || `/api/videos/${videoId}/stream`;
    
    // For mobile, especially iOS, we might need explicit user interaction
    needsUserInteraction = isMobile;
    
    // If we're not on a mobile device, set a loading timeout
    // Use a longer timeout for desktop
    if (!isMobile) {
      loadingTimeout = setTimeout(() => {
        if (isLoading && !isPlaying) {
          console.error('Video loading timeout');
          hasError = true;
          isLoading = false;
          onLoadingStateChange(false);
          dispatch('error', { message: 'Loading timeout' });
        }
      }, 20000); // 20 seconds for desktop should be plenty of time
    }
    
    console.log('Player initialization:', {
      isMobile,
      isIOS,
      autoplay,
      requireFullscreen,
      videoUrl,
      needsUserInteraction
    });
  });

  function setupVideoListeners() {
    if (!videoElement) return;
    
    // Loading events
    videoElement.addEventListener('loadstart', () => {
      console.log('Video loadstart event');
      if (!needsUserInteraction || userInteracted) {
        isLoading = true;
        onLoadingStateChange(true);
      }
    });
    
    videoElement.addEventListener('loadeddata', () => {
      console.log('Video loadeddata event');
      isLoaded = true;
      
      if (!needsUserInteraction || userInteracted) {
        isLoading = false;
        onLoadingStateChange(false);
        
        if (autoplay && !needsUserInteraction) {
          attemptAutoplay();
        }
      }
    });
    
    // Error handling
    videoElement.addEventListener('error', (e) => {
      console.error('Video error event:', e);
      if (loadingTimeout) clearTimeout(loadingTimeout);
      
      // On mobile, don't immediately show error - might just need interaction
      if (isMobile && !userInteracted) {
        needsUserInteraction = true;
      } else {
        // On desktop, only show error if we're sure it's a real error
        // Check if the error is a meaningful one
        const errorCode = videoElement.error ? videoElement.error.code : 0;
        // MEDIA_ERR_ABORTED (1): User aborted
        // MEDIA_ERR_NETWORK (2): Network error
        // MEDIA_ERR_DECODE (3): Decoding error
        // MEDIA_ERR_SRC_NOT_SUPPORTED (4): Format not supported
        
        // Only show error message for real errors (network, decode, not supported)
        // Don't show for user abort or non-specific errors
        if (errorCode > 1) {
          hasError = true;
          isLoading = false;
          onLoadingStateChange(false);
          dispatch('error', { event: e, code: errorCode });
        }
      }
    });
    
    // Progress events
    videoElement.addEventListener('canplay', () => {
      console.log('Video canplay event');
      isLoaded = true;
      
      if (!needsUserInteraction || userInteracted) {
        isLoading = false;
        onLoadingStateChange(false);
      }
    });
    
    videoElement.addEventListener('playing', () => {
      console.log('Video playing event');
      isLoading = false;
      onLoadingStateChange(false);
      isPlaying = true;
      hasError = false; // Clear any errors if playback starts
      
      // If we have a loading timeout, clear it since video is playing
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }
    });
    
    videoElement.addEventListener('pause', () => {
      isPlaying = false;
    });
    
    // Fullscreen change events
    if (isMobile) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
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
      
      // On mobile, this is expected - just set the flag for user interaction
      if (isMobile) {
        needsUserInteraction = true;
      }
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
      isFullscreen = true;
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }
  
  async function exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      console.log('Fullscreen exited');
      isFullscreen = false;
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  }
  
  async function toggleFullscreen() {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }
  
  function handleFullscreenChange() {
    isFullscreen = 
      !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement || 
      !!(videoElement && videoElement.webkitDisplayingFullscreen);
      
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

  // Handle explicit user interaction for mobile
  async function handleUserInteraction() {
    if (!videoElement || !isLoaded) return;
    
    console.log('Explicit user interaction');
    userInteracted = true;
    needsUserInteraction = false;
    
    try {
      // On mobile, reset any errors - user interaction may fix them
      hasError = false;
      isLoading = true;
      onLoadingStateChange(true);
      
      // For iOS we need to load the video again sometimes
      if (isMobile) {
        videoElement.load();
        
        // Give a small delay for the video to start loading
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await videoElement.play();
      isPlaying = true;
      
      // Try fullscreen on mobile if required
      if (requireFullscreen && isMobile) {
        setTimeout(enterFullscreen, 300);
      }
      
      console.log('User-initiated playback successful');
      isLoading = false;
      onLoadingStateChange(false);
    } catch (err) {
      console.error('User-initiated playback error:', err);
      isPlaying = false;
      hasError = true;
      isLoading = false;
      onLoadingStateChange(false);
      dispatch('error', { message: 'Failed to play video after user interaction' });
    }
  }
  
  function handlePlayPause() {
    if (needsUserInteraction && !userInteracted) {
      handleUserInteraction();
      return;
    }
    
    if (!videoElement || !isLoaded) return;
    
    if (videoElement.paused) {
      videoElement.play().then(() => {
        isPlaying = true;
      }).catch((err) => {
        console.error('Play error:', err);
      });
    } else {
      videoElement.pause();
      isPlaying = false;
    }
  }
  
  // Handle video element click
  function handleClick() {
    if (needsUserInteraction && !userInteracted) {
      handleUserInteraction();
    } else {
      handlePlayPause();
    }
  }

  function handleSeek(e: MouseEvent) {
    if (!videoElement || !playerContainer || !isLoaded || !userInteracted) return;
    
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
    
    // Remove fullscreen listeners
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
  {#if isLoading && (!needsUserInteraction || userInteracted)}
    <div class="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent mb-4"></div>
        <span class="text-white text-sm">Video wird geladen...</span>
      </div>
    </div>
  {/if}
  
  <!-- Mobile Interactive Play Screen -->
  {#if needsUserInteraction && !userInteracted && !hasError}
    <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div class="text-center">
        <div 
          class=" text-green-500 h-12 w-12 rounded-full flex justify-center items-center mx-auto mb-4 cursor-pointer hover:bg-green-400 transition-colors"
          on:click={handleUserInteraction}
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
          <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
        </svg>
        
        
        </div>
        <h3 class="text-white text-lg font-medium mb-2">Video abspielen</h3>
        <p class="text-gray-300 text-sm">Tippe auf Play, um das Video zu starten</p>
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
        <div class="flex justify-center space-x-4">
          <button 
            class="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-lg transition"
            on:click={() => {
              hasError = false;
              needsUserInteraction = true;
              userInteracted = false;
            }}
          >
            Erneut versuchen
          </button>
        </div>
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

  <!-- Play Button for Mobile (always visible when paused but loaded) -->
  {#if isMobile && !isPlaying && isLoaded && !hasError && !needsUserInteraction}
    <button
      class="absolute inset-0 flex items-center justify-center bg-black/40 z-5"
      on:click={handleClick}
      aria-label="Video abspielen"
    >
      
    </button>
  {/if}

  <!-- Custom Controls for Desktop (or mobile when not requiring fullscreen) -->
  {#if (!requireFullscreen || !isMobile) && (!needsUserInteraction || userInteracted)}
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
          
          <!-- Fullscreen Button (Added to bottom right) -->
          <button
            class="text-white hover:text-green-500 transition-colors"
            on:click={toggleFullscreen}
            aria-label={isFullscreen ? "Vollbild beenden" : "Vollbild"}
          >
            {#if isFullscreen}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M9 15v4.5M9 15H4.5M15 15h4.5M15 15v4.5" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>