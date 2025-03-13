<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
  
    export let videoId: string;
    export let title: string;
    export let directUrl: string = ''; // Neue Prop für direkte URL
  
    let videoElement: HTMLVideoElement;
    let playerContainer: HTMLDivElement;
    let isPlaying = false;
    let progress = 0;
    let volume = 1;
    let currentTime = '0:00';
    let duration = '0:00';
    let isFullscreen = false;
    let showControls = true;
    let isLoaded = false;
    let controlsTimeout: NodeJS.Timeout;
    let videoUrl = '';
    
    // Lade das Video
    onMount(async () => {
      if (browser) {
        // Setze die Video-URL
        if (directUrl) {
          console.log('Verwende direkte URL:', directUrl);
          videoUrl = directUrl;
        } else {
          console.log('Verwende API-URL für Video-ID:', videoId);
          videoUrl = `/api/videos/${videoId}/stream`;
        }
        
        console.log('Video-URL gesetzt:', videoUrl);
        
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
      
      console.log('Video-Update:', {
        currentTime: videoElement.currentTime, duration: videoElement.duration, readyState: videoElement.readyState
      });
      progress = (videoElement.currentTime / videoElement.duration) * 100;
      currentTime = formatTime(videoElement.currentTime);
      duration = formatTime(videoElement.duration);
    };
  
    // Play/Pause Toggle
    const togglePlay = () => {
      if (!videoElement) return;
      
      console.log('Toggle Play. Ready State:', videoElement.readyState);
      
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
      if (!videoElement || !playerContainer) return;

      // Überprüfe, ob das Video geladen ist
      if (!isLoaded) {
        console.error('Video is not loaded yet');
        return;
      }
      // Überprüfe, ob duration ein gültiger Wert ist
      if (!videoElement.duration || !isFinite(videoElement.duration)) {
        console.error('Video duration is not valid:', videoElement.duration);
        return;
      }
      
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      
      // Berechne die neue Zeit und stelle sicher, dass sie gültig ist
      const newTime = percent * videoElement.duration;
      if (isFinite(newTime) && newTime >= 0 && newTime <= videoElement.duration) {
        videoElement.currentTime = newTime;
      } else {
        console.error('Invalid seek time calculated:', newTime, 'Duration:', videoElement.duration, 'Percent:', percent);
      }
    };
  
    // Fullscreen Toggle
    const toggleFullscreen = async () => {
      if (!playerContainer) return;
      
      if (!isFullscreen) {
        try {
          if (playerContainer.requestFullscreen) {
            await playerContainer.requestFullscreen();
          }
        } catch (err) {
          console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
        }
      } else {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
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
      on:timeupdate={handleTimeUpdate}
      on:play={() => isPlaying = true}
      on:loadedmetadata={(e) => {
        console.log('Video metadata loaded:', {
          duration: videoElement?.duration,
          readyState: videoElement?.readyState
        });
        isLoaded = true;
      }}
      on:canplay={() => {
        console.log('Video can play now');
        isLoaded = true;
      }}
      on:error={(e) => {
        console.error('Video loading error:', e);
        console.error('Video error details:', videoElement?.error);
      }}
      on:pause={() => isPlaying = false}
      on:click={togglePlay}
      on:dblclick={toggleFullscreen}
    >
      {#if videoUrl}
        <source src={videoUrl} type="video/mp4">
      {/if}
      Ihr Browser unterstützt keine Video-Wiedergabe.
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
              class="w-20"
            >
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