<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let targetId: string = "tickets";
  export let label: string = "Tickets sichern";
  export let className = "font-heading font-medium px-6 py-3 text-white border border-green-500 hover:bg-green-500 hover:text-black rounded-full transition duration-200";
  
  let isLoading = false;
  let mounted = false;
  let scrollAttempts = 0;
  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY = 200;

  // Debug logging
  $: if (browser) {
    const debugInfo = {
      currentPath: window.location.pathname,
      hash: window.location.hash,
      targetExists: document.getElementById(targetId) !== null,
      isLoading,
      mounted,
      sessionTarget: sessionStorage.getItem('scrollTarget')
    };
    console.log('ScrollButton Debug:', debugInfo);
  }

  onMount(() => {
    mounted = true;
    if (browser) {
      checkForPendingScroll();
    }
  });

  async function checkForPendingScroll() {
    try {
      const pendingTarget = browser ? sessionStorage.getItem('scrollTarget') : null;
      const currentHash = browser ? window.location.hash.slice(1) : '';
      
      if (pendingTarget) {
        sessionStorage.removeItem('scrollTarget');
        await attemptScroll();
      } else if (currentHash === targetId) {
        await attemptScroll();
      }
    } catch (error) {
      console.error('Check scroll error:', error);
    }
  }

  async function attemptScroll(maxRetries = MAX_ATTEMPTS): Promise<boolean> {
    return new Promise((resolve) => {
      const tryScroll = async (attempt = 0) => {
        const element = document.getElementById(targetId);
        
        if (element) {
          try {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            resolve(true);
          } catch (error) {
            console.error('Scroll error:', error);
            resolve(false);
          }
        } else if (attempt < maxRetries) {
          setTimeout(() => tryScroll(attempt + 1), RETRY_DELAY);
        } else {
          console.warn(`Element #${targetId} nicht gefunden nach ${maxRetries} Versuchen`);
          resolve(false);
        }
      };

      tryScroll();
    });
  }

  const handleScroll = async () => {
    if (isLoading || !browser) return;
    isLoading = true;

    try {
      const element = document.getElementById(targetId);
      
      if (element) {
        await attemptScroll();
      } else {
        const currentPath = window.location.pathname;
        sessionStorage.setItem('scrollTarget', targetId);
        
        // Force a hard navigation to ensure proper page load
        window.location.href = `/#${targetId}`;
        return; // Prevent further execution
      }
    } catch (error) {
      console.error('Navigation/Scroll error:', error);
    } finally {
      isLoading = false;
    }
  };
</script>

<button
  on:click={handleScroll}
  disabled={isLoading || !mounted || !browser}
  class="{className} disabled:opacity-50"
>
  {#if isLoading}
    <span class="inline-flex items-center">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Einen Moment...
    </span>
  {:else}
    {label}
  {/if}
</button>