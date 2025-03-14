<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
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
  
  let videoElement: HTMLVideoElementWithWebkit;
  let playerContainer: HTMLDivElement;
  let videoUrl = '';
  let isLoaded = false;
  let isPlaying = false;
  let showControls = true;
  let controlsTimeout: NodeJS.Timeout;
  let progress = 0;
  let volume = 1;
  let currentTime = '0:00';
  let duration = '0:00';
  
  onMount(() => {
    if (!browser) return;
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    videoUrl = directUrl || `/api/videos/${videoId}/stream`;
    
    console.log('Player wird initialisiert:', {
      isMobile,
      autoplay,
      requireFullscreen
    });
    
    if (videoElement) {
      videoElement.addEventListener('loadeddata', async () => {
        console.log('Video geladen, versuche Autoplay');
        isLoaded = true;
        onLoadingStateChange(false);
        
        try {
          if (autoplay) {
            await videoElement.play();
            isPlaying = true;
            console.log('Autoplay erfolgreich');
            
            // Nur für Mobile Vollbildmodus aktivieren
            if (requireFullscreen && isMobile) {
              if (videoElement.webkitEnterFullscreen) {
                await videoElement.webkitEnterFullscreen();
              } else if (playerContainer?.requestFullscreen) {
                await playerContainer.requestFullscreen();
              }
              console.log('Mobile: Vollbildmodus aktiviert');
            }
          }
        } catch (err) {
          console.error('Fehler beim Starten:', err);
          isPlaying = false;
        }
      });
    }
  });

  function handleMouseMove() {
    showControls = true;
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) showControls = false;
    }, 2000);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleTimeUpdate() {
    if (!videoElement) return;
    
    progress = (videoElement.currentTime / videoElement.duration) * 100;
    currentTime = formatTime(videoElement.currentTime);
    duration = formatTime(videoElement.duration);
  }

  function handleClick() {
    if (!videoElement || !isLoaded) return;
    
    if (videoElement.paused) {
      videoElement.play().then(() => {
        isPlaying = true;
      }).catch(console.error);
    } else {
      videoElement.pause();
      isPlaying = false;
    }
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
  });
</script>

<div 
  class="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
  bind:this={playerContainer}
  on:mousemove={handleMouseMove}
  on:mouseleave={() => showControls = false}
>
  <video
    bind:this={videoElement}
    class="w-full h-full"
    playsInline
    preload="auto"
    on:click={handleClick}
    on:timeupdate={handleTimeUpdate}
    on:error={(e) => {
      console.error('Video Fehler:', e);
      onLoadingStateChange(false);
    }}
  >
    {#if videoUrl}
      <source src={videoUrl} type="video/mp4">
    {/if}
    <p class="text-center p-4">Ihr Browser unterstützt keine Video-Wiedergabe.</p>
  </video>

  <!-- Custom Controls für Desktop -->
  {#if !requireFullscreen}
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
            on:click={handleClick}
            disabled={!isLoaded}
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