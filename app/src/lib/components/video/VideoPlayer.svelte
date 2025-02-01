<script lang="ts">
  import { onMount } from 'svelte';

  export let url: string;
  export let chapters: Array<{ title: string; timestamp: number }> | undefined = undefined;

  let player: any;
  let videoElement: HTMLVideoElement;
  let currentTime = 0;
  let duration = 0;
  let isPlaying = false;

  onMount(() => {
    if (videoElement) {
      videoElement.addEventListener('timeupdate', () => {
        currentTime = videoElement.currentTime;
      });
      videoElement.addEventListener('loadedmetadata', () => {
        duration = videoElement.duration;
      });
    }
  });

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function togglePlay() {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      isPlaying = !isPlaying;
    }
  }

  function seekTo(timestamp: number) {
    if (videoElement) {
      videoElement.currentTime = timestamp;
    }
  }
</script>

<div class="relative">
  <!-- Video Player -->
  <div class="aspect-video bg-black rounded-lg overflow-hidden">
    <video
      bind:this={videoElement}
      class="w-full h-full"
      src={url}
      controls
      on:play={() => (isPlaying = true)}
      on:pause={() => (isPlaying = false)}
    >
      <track kind="captions" />
    </video>
  </div>

  <!-- Chapters (if available) -->
  {#if chapters && chapters.length > 0}
    <div class="mt-4 bg-white/5 rounded-lg p-4">
      <h3 class="text-lg font-medium mb-3">Kapitel</h3>
      <div class="space-y-2">
        {#each chapters as chapter}
          <button
            class="w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors flex items-center justify-between"
            on:click={() => seekTo(chapter.timestamp)}
          >
            <span>{chapter.title}</span>
            <span class="text-sm text-white/60">{formatTime(chapter.timestamp)}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>