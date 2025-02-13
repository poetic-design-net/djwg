<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let targetId: string = "tickets";
  export let label: string = "Tickets sichern";
  export let className = "font-heading font-medium px-6 py-3 text-white border border-green-500 hover:bg-green-500 hover:text-black rounded-full transition duration-200";
  
  let isLoading = false;
  let mounted = false;

  onMount(() => {
    mounted = true;
    checkForPendingScroll();
  });

  // Überprüft, ob wir nach einer Navigation scrollen müssen
  function checkForPendingScroll() {
    const pendingTarget = sessionStorage.getItem('scrollTarget');
    if (pendingTarget) {
      sessionStorage.removeItem('scrollTarget');
      const [targetPath, targetAnchor] = pendingTarget.split('#');
      
      // Nur scrollen, wenn wir auf dem richtigen Pfad sind
      if (window.location.pathname === targetPath) {
        setTimeout(scrollToElement, 100);
      }
    } else {
      // Überprüfe auch den aktuellen URL-Hash
      const currentHash = window.location.hash.slice(1);
      if (currentHash === targetId) {
        setTimeout(scrollToElement, 100);
      }
    }
  }

  function scrollToElement() {
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      return true;
    }
    return false;
  }

  const handleScroll = async () => {
    if (isLoading) return;
    isLoading = true;

    try {
      const currentPath = window.location.pathname;
      const hasTargetElement = document.getElementById(targetId) !== null;

      if (hasTargetElement) {
        // Element existiert auf aktueller Seite
        scrollToElement();
      } else {
        // Speichere aktuellen Pfad und Ziel für Navigation
        sessionStorage.setItem('scrollTarget', `/#${targetId}`);
        
        // Navigiere zur Home mit Anker
        await goto(`/#${targetId}`);
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
  disabled={isLoading || !mounted}
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