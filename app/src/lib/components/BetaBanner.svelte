<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let enabled = true;
  const isVisible = writable(false);
  let isFading = false;
  
  onMount(() => {
      if (!enabled) return;
      const bannerClosed = localStorage.getItem('betaBannerClosed');
      if (!bannerClosed) {
          // Verzögertes Einblenden
          setTimeout(() => {
              isVisible.set(true);
              // Automatisches Ausblenden nach 5 Sekunden
              setTimeout(() => {
                  closeBanner();
              }, 5000);
          }, 500); // 500ms Verzögerung vor dem Einblenden
      }
  });

  function closeBanner() {
    isFading = true;
    setTimeout(() => {
      isVisible.set(false);
      localStorage.setItem('betaBannerClosed', 'true');
    }, 500); // Warte 500ms für die Übergangsanimation
  }
</script>

<div class="beta-banner fixed top-0 left-0 right-0 bg-purple-600 text-white py-6 px-4 flex justify-between items-center z-[101] transition-all duration-500 ease-in-out {$isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}" aria-hidden={!$isVisible}>
  <p class="text-md font-medium text-center">
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

<div class="h-10 transition-all duration-500 ease-in-out" class:h-0={!$isVisible}></div>