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
    // Check if we need to scroll after navigation
    const shouldScroll = sessionStorage.getItem('scrollTarget') === targetId;
    if (shouldScroll) {
      sessionStorage.removeItem('scrollTarget');
      setTimeout(scrollToElement, 100);
    }
  });

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
    }
  }

  const handleScroll = async () => {
    if (isLoading) return;
    isLoading = true;

    try {
      if (window.location.pathname === '/') {
        scrollToElement();
      } else {
        // Store the target ID before navigation
        sessionStorage.setItem('scrollTarget', targetId);
        await goto(`/#${targetId}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
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