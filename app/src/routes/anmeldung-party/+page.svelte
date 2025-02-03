<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data;

  let video: HTMLVideoElement;
  let isMuted = true;

  function toggleSound() {
    if (video) {
      video.muted = !video.muted;
      isMuted = video.muted;
    }
  }
</script>

<div class="min-h-screen bg-black text-white py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-4">DJ CLICK, DEFRA, BASSMASSAGE, MiBA, COOPER, DAWN, PD, YVELLICIOUS, OLDE</h1>
      <h2 class="text-2xl mb-2">Resident Club Night – ✨DJ CLICK & Friends✨</h2>
      <p class="text-xl">15.03.2025 · 22:00</p>
    </div>

    <div class="max-w-md mx-auto relative mb-12">
      <button
        on:click={toggleSound}
        class="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/75 text-white p-4 h-16 w-16 rounded-full transition-colors"
      >
        {#if isMuted}
          <span class="text-2xl">🔇</span>
        {:else}
          <span class="text-2xl">🔊</span>
        {/if}
      </button>

      <video
        bind:this={video}
        src="https://cdn.sanity.io/files/kijh3dc6/production/011d468cf96a1dbd932137e799f1af3cfe19f361.mp4"
        class="w-full rounded-lg shadow-xl"
        autoplay
        loop
        muted
        playsinline
        controls
      />
    </div>

    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8 space-y-4">
        <p>Am 15.03.2025 erwartet euch ein Special Event.</p>
        <p>DJ CLICK lädt seine Freunde vom DJ Workshop Germany ein und feiert mit euch eine ganz spezielle Nacht.</p>
        <p>Dieses mal gibt es eine besondere Mischung aus HIP HOP, Electronische Musik und dem besten aus den Charts.</p>
      </div>

      <div class="mb-8">
        <h3 class="text-2xl font-bold mb-4">Lineup:</h3>
        <ul class="space-y-2">
          <li>DJ CLICK</li>
          <li>DEFRA</li>
          <li>BASSMASSAGE</li>
          <li>MiBA</li>
          <li>COOPER</li>
          <li>DAWN</li>
          <li>PD</li>
          <li>YVELLICIOUS</li>
          <li>OLDE</li>
        </ul>
      </div>

      <div class="mb-8">
        <p>AK ab 22:00</p>
        <p>Einlass ab 18</p>
      </div>

      <div class="relative">
        <a 
          href="https://zita-club.de/events/resident-club-night-%E2%9C%A8dj-click-friends%E2%9C%A8/"
          target="_blank"
          rel="noopener noreferrer" 
          class="inline-block bg-green-400 hover:bg-green-500 text-black py-3 px-8 rounded-full font-medium transition-colors"
        >
          Ticket kaufen
        </a>
        <p class="mt-2 text-sm text-gray-400">
          Weiterleitung zu zita-club.de
        </p>
      </div>
    </div>
  </div>
</div>