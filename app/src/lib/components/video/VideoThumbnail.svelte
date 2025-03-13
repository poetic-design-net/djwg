<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
  import { browser } from '$app/environment';
  
  export let videoUrl: string;
  export let cacheKey: string = ''; // Eindeutiger Key für Caching
  export let width: number = 640;  // Höhere Auflösung für bessere Qualität
  export let height: number = 360; // Höhere Auflösung für bessere Qualität
  
  let canvas: HTMLCanvasElement;
  let thumbnailUrl: string = '';
  let isLoading: boolean = true;
  let error: string | null = null;
  let videoElement: HTMLVideoElement | null = null;
  
  const dispatch = createEventDispatcher();

  // Debug-Funktion
  function log(message: string, data?: any) {
    console.debug(`[VideoThumbnail] ${message}`, data || '');
  }
  
  // Versuche, ein gecachtes Thumbnail zu laden
  if (browser && cacheKey) {
    const cachedThumbnail = localStorage.getItem(`video_thumbnail_${cacheKey}`);
    if (cachedThumbnail) {
      log('Cached thumbnail gefunden');
      thumbnailUrl = cachedThumbnail;
      isLoading = false;
    } else {
      log('Kein cached thumbnail gefunden');
    }
  }
  
  onMount(async () => {
    if (!videoUrl) {
      error = 'Keine Video-URL angegeben';
      isLoading = false;
      return;
    }
    
    log('Video-URL:', videoUrl);
    
    if (!thumbnailUrl) {
      await generateThumbnail();
    }
  });
  
  async function generateThumbnail() {
    try {
      isLoading = true;
      log('Starte Thumbnail-Generierung');
      
      // Erstelle ein temporäres Video-Element
      videoElement = document.createElement('video');
      videoElement.crossOrigin = 'anonymous';
      videoElement.preload = 'metadata';
      videoElement.muted = true;
      
      // Setze Ereignishandler vor dem Laden
      const videoLoadPromise = new Promise<void>((resolve, reject) => {
        if (!videoElement) return reject('Kein Video-Element');
        
        videoElement.onloadedmetadata = () => {
          log('Video Metadaten geladen');
          videoElement!.currentTime = 1;
        };
        
        videoElement.oncanplay = () => {
          log('Video kann abgespielt werden');
          resolve();
        };
        
        videoElement.onerror = (e) => {
          log('Video-Ladefehler:', videoElement?.error);
          reject(new Error(`Video-Ladefehler: ${videoElement?.error?.message || 'Unbekannter Fehler'}`));
        };
      });
      
      // Starte das Laden
      videoElement.src = videoUrl;
      
      // Warte auf das Laden mit Timeout
      await Promise.race([
        videoLoadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout beim Laden des Videos')), 10000))
      ]);
      
      // Warte auf das seeked-Event
      await new Promise<void>((resolve) => {
        if (!videoElement) return;
        videoElement.onseeked = () => {
          log('Video zu Position gesprungen');
          resolve();
        };
      });
      
      // Zeichne das Video auf den Canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas-Kontext konnte nicht erstellt werden');
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!videoElement) {
        throw new Error('Video-Element nicht verfügbar');
      }
      
      log('Zeichne Video auf Canvas');
      ctx.drawImage(videoElement, 0, 0, width, height);
      
      // Generiere Thumbnail mit WebP oder PNG Fallback
      try {
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                thumbnailUrl = URL.createObjectURL(blob);
                log('Thumbnail generiert:', { size: blob.size });
                
                if (browser && cacheKey) {
                  try {
                    localStorage.setItem(`video_thumbnail_${cacheKey}`, thumbnailUrl);
                    log('Thumbnail gecached');
                  } catch (e) {
                    console.warn('Cache-Fehler:', e);
                  }
                }
                
                dispatch('thumbnail', { url: thumbnailUrl });
                resolve();
              } else {
                reject(new Error('Blob konnte nicht erstellt werden'));
              }
            },
            'image/webp',
            0.9
          );
        });
      } catch (err) {
        log('WebP nicht unterstützt, verwende PNG');
        thumbnailUrl = canvas.toDataURL('image/png');
        dispatch('thumbnail', { url: thumbnailUrl });
      }
      
    } catch (err) {
      console.error('Thumbnail-Generierungsfehler:', err);
      error = err instanceof Error ? err.message : 'Unbekannter Fehler';
    } finally {
      if (videoElement) {
        videoElement.src = '';
        videoElement = null;
      }
      isLoading = false;
    }
  }

  onDestroy(() => {
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      log('Bereinige Blob-URL');
      URL.revokeObjectURL(thumbnailUrl);
    }
    if (videoElement) {
      videoElement.src = '';
      videoElement = null;
    }
  });
</script>

<div class="relative">
  <canvas 
    bind:this={canvas} 
    class="hidden"
    width={width} 
    height={height}
  ></canvas>
  
  {#if isLoading}
    <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
      <div class="text-gray-500">Thumbnail wird generiert...</div>
    </div>
  {:else if error}
    <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
      <div class="text-gray-500">Fehler: {error}</div>
    </div>
  {:else if thumbnailUrl}
    <img 
      src={thumbnailUrl} 
      alt="Video-Thumbnail" 
      class="w-full aspect-video object-cover"
      on:error={() => {
        error = 'Thumbnail konnte nicht geladen werden';
        if (thumbnailUrl.startsWith('blob:')) {
          URL.revokeObjectURL(thumbnailUrl);
        }
      }}
    />
  {:else}
    <div class="w-full aspect-video bg-gray-800 flex items-center justify-center">
      <div class="text-gray-500">Kein Thumbnail</div>
    </div>
  {/if}
</div>