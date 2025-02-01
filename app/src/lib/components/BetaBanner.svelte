<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const isVisible = writable(true);
  
  // Prüfe beim Laden, ob der Banner bereits geschlossen wurde
  onMount(() => {
    const bannerClosed = localStorage.getItem('betaBannerClosed');
    if (bannerClosed) {
      isVisible.set(false);
    }
  });

  function closeBanner() {
    isVisible.set(false);
    localStorage.setItem('betaBannerClosed', 'true');
  }
</script>

{#if $isVisible}
  <div class="fixed top-0 left-0 right-0 bg-purple-600 text-white py-2 px-4 flex justify-between items-center z-[101]">
    <p class="text-sm font-medium text-center">
      🚧 Diese Website befindet sich noch in der Beta-Phase. Es können gelegentlich Fehler auftreten.
    </p>
    <button
      on:click={closeBanner}
      class="ml-4 text-white hover:text-blue-200 focus:outline-none"
      aria-label="Beta-Banner schließen"
    >
      ✕
    </button>
  </div>
{/if}

{#if $isVisible}
  <div class="h-10"></div>
{/if}