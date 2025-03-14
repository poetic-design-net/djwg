<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  export let videoId: string;
  export let title: string;
  export let directUrl: string = '';
  export let autoplay: boolean = false;
  export let requireFullscreen: boolean = false;
  export let onLoadingStateChange: (isLoading: boolean) => void = () => {};
  
  // Erweitere HTMLVideoElement um iOS-spezifische Methoden
  interface HTMLVideoElementWithWebkit extends HTMLVideoElement {
    webkitEnterFullscreen?: () => Promise<void>;
    webkitSupportsFullscreen?: boolean;
    webkitDisplayingFullscreen?: boolean;
    webkitExitFullscreen?: () => Promise<void>;
  }
  
  let videoElement: HTMLVideoElementWithWebkit;
  let playerContainer: HTMLDivElement;
  let isPlaying = false;
  let progress = 0;
  let volume = 1;
  let currentTime = '0:00';
  let duration = '0:00';
  let isFullscreen = false;
  let showControls = true;
  let isLoaded = false;
  let readyToPlay = false;
  let controlsTimeout: NodeJS.Timeout;
  let videoUrl = '';
  
  // Lade das Video
  onMount(async () => {
    if (browser) {      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log('Video wird initialisiert:', {
        isMobile,
        userAgent: navigator.userAgent,
        autoplay,
        requireFullscreen
      });
      
      // Setze die Video-URL
      videoUrl = directUrl || `/api/videos/${videoId}/stream`;
      console.log('Video-URL gesetzt:', videoUrl);
      
      // Warte bis das Video wirklich bereit ist
      if (videoElement) {
        videoElement.addEventListener('canplaythrough', async () => {
          console.log('Video ist bereit:', {
            readyState: videoElement.readyState,
            duration: videoElement.duration
          });
          
          isLoaded = true;
          readyToPlay = true;
          onLoadingStateChange(false);
          
          // Aktiviere Vollbildmodus wenn erforderlich
          if (requireFullscreen) {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            try {
              console.log('Versuche Vollbildmodus zu aktivieren:', {
                isMobile,
                hasWebkit: !!videoElement?.webkitEnterFullscreen,
                hasStandard: !!playerContainer?.requestFullscreen
              });

              if (isMobile && videoElement?.webkitEnterFullscreen) {
                await videoElement.webkitEnterFullscreen();
                isFullscreen = true;
              } else if (playerContainer?.requestFullscreen) {
                await playerContainer.requestFullscreen();
                isFullscreen = true;
              }
            } catch (err) {
              console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
            }
          }
          
          // Starte Autoplay wenn aktiviert
          if (autoplay) {
            videoElement.muted = true; // Erforderlich für mobiles Autoplay
            try {
              await videoElement.play();
              console.log('Autoplay erfolgreich gestartet');
            } catch (err) {
              console.error('Autoplay fehlgeschlagen:', err);
            }
          }
        });

        // Event-Listener für iOS Fullscreen
        videoElement.addEventListener('webkitbeginfullscreen', () => {
          console.log('iOS Vollbildmodus gestartet');
          isFullscreen = true;
        });

        videoElement.addEventListener('webkitendfullscreen', () => {
          console.log('iOS Vollbildmodus beendet');
          isFullscreen = false;
        });
      }

      // Event-Listener hinzufügen
      document.addEventListener('keydown', handleKeydown);
      window.addEventListener('contextmenu', preventContextMenu);
    }
  });
  
  // Verhindere Rechtsklick
  const preventContextMenu = (e: MouseEvent) => e.preventDefault();
  
  // Formatiere Zeit (Sekunden -> MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Verstecke Controls nach Inaktivität
  const handleMouseMove = () => {
    showControls = true;
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) showControls = false;
    }, 2000);
  };
  
  // Update Progress
  const handleTimeUpdate = () => {
    if (!videoElement) return;
    
    progress = (videoElement.currentTime / videoElement.duration) * 100;
    currentTime = formatTime(videoElement.currentTime);
    duration = formatTime(videoElement.duration);
  };
  
  // Play/Pause Toggle
  const togglePlay = () => {
    if (!videoElement || !readyToPlay) return;
    
    console.log('Toggle Play:', {
      readyState: videoElement.readyState,
      readyToPlay,
      isPlaying
    });
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().then(() => {
        console.log('Video playback started');
      }).catch(err => {
        console.error('Error playing video:', err);
      });
    }
    isPlaying = !isPlaying;
  };
  
  // Volume Control
  const updateVolume = (e: Event) => {
    if (!videoElement) return;
    const input = e.target as HTMLInputElement;
    volume = parseFloat(input.value);
    videoElement.volume = volume;
  };
  
  // Seek Control
  const handleSeek = (e: MouseEvent) => {
    if (!videoElement || !playerContainer || !isLoaded) return;
    
    if (!videoElement.duration || !isFinite(videoElement.duration)) {
      console.error('Video duration is not valid:', videoElement.duration);
      return;
    }
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    const newTime = percent * videoElement.duration;
    if (isFinite(newTime) && newTime >= 0 && newTime <= videoElement.duration) {
      videoElement.currentTime = newTime;
    }
  };
  
  // Fullscreen Toggle
  const toggleFullscreen = async () => {
    if (!playerContainer) return;
    
    if (!isFullscreen) {
      try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        console.log('Versuche Vollbildmodus zu aktivieren:', {
          isMobile,
          hasWebkit: !!videoElement?.webkitEnterFullscreen,
          hasStandard: !!playerContainer?.requestFullscreen
        });
        
        if (isMobile && videoElement?.webkitEnterFullscreen) {
          await videoElement.webkitEnterFullscreen();
        } else if (playerContainer.requestFullscreen) {
          await playerContainer.requestFullscreen();
        }
        isFullscreen = true;
      } catch (err) {
        console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          isFullscreen = false;
        }
      } catch (err) {
        console.error('Fehler beim Verlassen des Vollbildmodus:', err);
      }
    }
  };
  
  // Tastatur-Steuerung
  const handleKeydown = (e: KeyboardEvent) => {
    if (!videoElement) return;
    
    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'arrowright':
        e.preventDefault();
        videoElement.currentTime += 5;
        break;
      case 'arrowleft':
        e.preventDefault();
        videoElement.currentTime -= 5;
        break;
      case 'm':
        e.preventDefault();
        videoElement.muted = !videoElement.muted;
        break;
    }
  };
  
  onDestroy(() => {
    if (browser) {
      document.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('contextmenu', preventContextMenu);
      if (controlsTimeout) clearTimeout(controlsTimeout);
    }
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
    muted={autoplay}
    on:timeupdate={handleTimeUpdate}
    on:play={() => isPlaying = true}
    on:loadedmetadata={() => {
      console.log('Video metadata geladen:', {
        duration: videoElement?.duration,
        url: videoUrl,
        readyState: videoElement?.readyState
      });
      if (videoElement?.readyState >= 1) {
        readyToPlay = true;
        isLoaded = true;
      }
    }}
    on:canplay={() => {
      console.log('Video kann abgespielt werden:', {
        readyState: videoElement?.readyState,
        duration: videoElement?.duration
      });
      isLoaded = true;
      onLoadingStateChange(false);
    }}
    on:error={(e) => {
      console.error('Video loading error:', e);
      console.error('Video error details:', videoElement?.error);
      onLoadingStateChange(false);
    }}
    on:pause={() => isPlaying = false}
    on:click={togglePlay}
    on:dblclick={toggleFullscreen}
  >
    <track kind="captions"> <!-- Leerer Track für iOS -->
    {#if videoUrl}
      <source src={videoUrl} type="video/mp4">
    {/if}
    <p class="text-center p-4">Ihr Browser unterstützt keine Video-Wiedergabe.</p>
  </video>

  <!-- Custom Controls -->
  <div 
    class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300"
    class:opacity-0={!showControls}
    class:pointer-events-none={!showControls || !isLoaded}
  >
    <!-- Progress Bar -->
    <div 
      class="w-full h-1 bg-gray-600 mb-4 rounded-full overflow-hidden"
      class:cursor-pointer={isLoaded}
      class:opacity-50={!isLoaded}
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
          disabled={!isLoaded}
          class="text-white hover:text-green-500 transition-colors"
          class:opacity-50={!isLoaded}
          on:click={togglePlay}
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
            disabled={!isLoaded}
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            on:input={updateVolume}
            class="w-20 accent-tourquis-500"
          />
        </div>

        <!-- Time -->
        <div class="text-white text-sm">
          {currentTime} / {duration}
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <!-- Title -->
        <span class="text-white text-sm hidden md:block">{title}</span>

        <!-- Fullscreen -->
        <button
          disabled={!isLoaded}
          class="text-white hover:text-green-500 transition-colors"
          class:opacity-50={!isLoaded}
          on:click={toggleFullscreen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>