<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';

  export let videoId: string;
  export let title: string;
  export let directUrl: string = '';
  export let autoplay: boolean = false;
  export let requireFullscreen: boolean = false; // Now only controls if fullscreen button is shown, no auto-fullscreen
  export let onLoadingStateChange: (isLoading: boolean) => void = () => {};
  
  interface HTMLVideoElementWithWebkit extends HTMLVideoElement {
    webkitEnterFullscreen?: () => Promise<void>;
    webkitSupportsFullscreen?: boolean;
    webkitDisplayingFullscreen?: boolean;
    'webkit-playsinline'?: boolean;
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
  let isMobile = false;
  let isFullscreen = false;
  
  // For mobile-specific behavior
  let needsUserInteraction = false;
  let userInteracted = false;
  
  onMount(() => {
    if (!browser) return;
    
    // Signal loading state immediately
    onLoadingStateChange(true);
    
    // Detect mobile device once
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Set video URL
    videoUrl = directUrl || `/api/videos/${videoId}/stream`;
    
    // For mobile, especially iOS, we need explicit user interaction
    needsUserInteraction = isMobile;
    
    // Setup fullscreen change detection
    if (requireFullscreen && isMobile) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
    
    console.log('Player initialized:', {
      isMobile,
      autoplay,
      requireFullscreen,
      videoUrl
    });
  });

  function setupVideoListeners() {
    if (!videoElement) return;
    
    // Simplified event handlers
    const events = {
      loadeddata: () => {
        isLoaded = true;
        isLoading = false;
        onLoadingStateChange(false);
        
        if (autoplay && !needsUserInteraction) {
          attemptAutoplay();
        }
      },
      
      error: (e: any) => {
        // Only mark as error if user has interacted or we're on desktop
        if (!isMobile || userInteracted) {
          console.error('Video error:', videoElement.error);
          hasError = true;
          isLoading = false;
          onLoadingStateChange(false);
          dispatch('error', { event: e, code: videoElement.error?.code });
        } else {
          // On mobile, before interaction, errors are expected
          needsUserInteraction = true;
        }
      },
      
      playing: () => {
        isLoading = false;
        onLoadingStateChange(false);
        isPlaying = true;
        hasError = false; 
      },
      
      pause: () => {
        isPlaying = false;
      },
      
      // Handle time updates for progress bar
      timeupdate: handleTimeUpdate
    };
    
    // Add all event listeners
    Object.entries(events).forEach(([event, handler]) => {
      videoElement.addEventListener(event, handler);
    });
  }
  
  async function attemptAutoplay() {
    if (!videoElement || !isLoaded) return;
    
    try {
      // Try with muted first (better autoplay chance)
      videoElement.muted = true;
      await videoElement.play();
      
      // If successful and originally not muted, unmute
      if (volume > 0) {
        videoElement.muted = false;
        videoElement.volume = volume;
      }
      
      isPlaying = true;
      
      // No longer automatically entering fullscreen
      // Fullscreen is now only triggered by the fullscreen button
    } catch (err) {
      console.error('Autoplay failed:', err);
      videoElement.muted = false;
      needsUserInteraction = true;
    }
  }
  
  async function enterFullscreen() {
    if (!videoElement || !playerContainer) return;
    
    try {
      // Try iOS native fullscreen first
      if (videoElement.webkitEnterFullscreen) {
        await videoElement.webkitEnterFullscreen();
      } 
      // Then try standard fullscreen
      else if (playerContainer.requestFullscreen) {
        await playerContainer.requestFullscreen();
      } 
      // Finally try webkit fullscreen
      else if ((document as any).webkitRequestFullscreen) {
        await (playerContainer as any).webkitRequestFullscreen();
      }
      
      isFullscreen = true;
    } catch (err) {
      console.error('Fullscreen failed:', err);
      // Continue playback even if fullscreen fails
    }
  }
  
  async function exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
      
      isFullscreen = false;
    } catch (err) {
      console.error('Exit fullscreen failed:', err);
    }
  }
  
  function toggleFullscreen() {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }
  
  function handleFullscreenChange() {
    isFullscreen = 
      !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement || 
      !!(videoElement && videoElement.webkitDisplayingFullscreen);
  }

  function handleMouseMove() {
    showControls = true;
    if (controlsTimeout) clearTimeout(controlsTimeout);
    
    // Only auto-hide controls on desktop when playing
    if (!isMobile) {
      controlsTimeout = setTimeout(() => {
        if (isPlaying) showControls = false;
      }, 2000);
    }
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
    if (!videoElement) return;
    
    userInteracted = true;
    needsUserInteraction = false;
    hasError = false;
    isLoading = true;
    onLoadingStateChange(true);
    
    try {
      // For iOS we often need to reload the video
      if (isMobile) {
        videoElement.load();
        // Small delay for loading
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await videoElement.play();
      isPlaying = true;
      
      // No longer automatically entering fullscreen when play is pressed
      
      isLoading = false;
      onLoadingStateChange(false);
    } catch (err) {
      console.error('User-initiated playback failed:', err);
      isPlaying = false;
      hasError = true;
      isLoading = false;
      onLoadingStateChange(false);
      dispatch('error', { message: 'Failed to play after user interaction' });
    }
  }
  
  function handlePlayPause() {
    if (needsUserInteraction && !userInteracted) {
      handleUserInteraction();
      return;
    }
    
    if (!videoElement || !isLoaded) return;
    
    if (videoElement.paused) {
      videoElement.play()
        .then(() => isPlaying = true)
        .catch(err => console.error('Play failed:', err));
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
    if (!videoElement || !isLoaded || !userInteracted) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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
    
    // Remove fullscreen listeners
    if (requireFullscreen && isMobile) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    }
    
    // Clean up video element
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
  on:mouseleave={() => !isMobile && isPlaying && (showControls = false)}
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
        <button 
          class=" text-green-500 h-16 w-16 rounded-full flex justify-center items-center mx-auto mb-4 cursor-pointer transition-colors"
          on:click={handleUserInteraction}
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
        
        </button>
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
          class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition"
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
  {/if}

  <!-- The Video -->
  <video
    bind:this={videoElement}
    class="w-full h-full"
    preload="auto"
    playsinline
    on:loadedmetadata={setupVideoListeners}
    on:click={handleClick}
  >
    {#if videoUrl}
      <source src={videoUrl} type="video/mp4">
    {/if}
    <p class="text-center p-4 text-white">Ihr Browser unterstützt keine Video-Wiedergabe.</p>
  </video>

  <!-- Simple Play Button Overlay for Mobile (when paused) -->
  {#if isMobile && !isPlaying && isLoaded && !hasError && !needsUserInteraction}
    <button
      class="absolute inset-0 flex items-center justify-center bg-black/30 z-5"
      on:click={handleClick}
      aria-label="Video abspielen"
    >
      <div class="bg-black/40 rounded-full p-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" class="size-8">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </button>
  {/if}

  <!-- Controls - Simplified for Mobile, More Complete for Desktop -->
  <div 
    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300"
    class:opacity-0={!showControls && !isMobile && isPlaying}
    class:pointer-events-none={!showControls && !isMobile && isPlaying}
  >
    <!-- Progress Bar -->
    <div 
      class="w-full h-2 bg-gray-600 mb-3 rounded-full overflow-hidden cursor-pointer"
      on:click={handleSeek}
    >
      <div 
        class="h-full bg-green-500 transition-all duration-100"
        style="width: {progress}%"
      />
    </div>

    <div class="flex items-center justify-between">
      <!-- Left Controls Group -->
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

        <!-- Volume (desktop only) -->
        {#if !isMobile}
          <div class="hidden sm:flex items-center space-x-2">
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
        {/if}

        <!-- Time -->
        <div class="text-white text-sm">
          {currentTime} / {duration}
        </div>
      </div>

      <!-- Right Controls Group -->
      <div class="flex items-center space-x-4">
        {#if !isMobile}
          <span class="text-white text-sm hidden md:block">{title}</span>
        {/if}
        
        <!-- Fullscreen Button -->
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
</div>