<script lang="ts">
  import { onMount } from 'svelte';
  import type { Logo } from '$lib/types/menu';
  import { page } from '$app/stores';
  import OptimizedImage from './OptimizedImage.svelte';
  
  export let logos: { data: Logo[] } = { data: [] };
  export let showButton = true;
  let currentHighlight = 0;

  // Hide button on partner page
  $: showButton = !$page.url.pathname.includes('/partner');

  onMount(() => {
    const interval = setInterval(() => {
      currentHighlight = (currentHighlight + 1) % logos.data.length;
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<div class="container px-4 mx-auto">
  <div class="mb-20 md:max-w-4xl text-center mx-auto">
    <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Unsere Aussteller</span>
    <h2 class="font-heading text-5xl lg:text-6xl text-white tracking-7xl lg:tracking-8xl">Unterstützt von führenden Marken der DJ-Industrie</h2>
  </div>
  <div class="md:max-w-7xl border border-gray-900 mx-auto mb-12">
    <div class="flex flex-wrap">
      {#each logos.data as logo, i}
        {#if logo.image}
          {#if logo.url}
            <a
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 {i < logos.data.length - 5 ? 'border-b' : 'lg:border-b-0'} {i % 5 !== 4 ? 'lg:border-r' : ''} {i % 2 === 0 ? 'md:border-r' : ''} border-gray-900 logo-container {currentHighlight === i ? 'highlight' : ''} hover:opacity-80 transition-opacity duration-300"
              style="height: 246px;"
            >
              <OptimizedImage
                image={logo.image}
                alt={logo.name || 'Partner Logo'}
                maxWidth={400}
                sizes="(max-width: 768px) 200px, 150px"
                className="max-w-[200px] max-h-[100px] w-auto h-auto object-contain"
              />
            </a>
          {:else}
            <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 {i < logos.data.length - 5 ? 'border-b' : 'lg:border-b-0'} {i % 5 !== 4 ? 'lg:border-r' : ''} {i % 2 === 0 ? 'md:border-r' : ''} border-gray-900 logo-container {currentHighlight === i ? 'highlight' : ''}" style="height: 246px;">
              <OptimizedImage
                image={logo.image}
                alt={logo.name || 'Partner Logo'}
                maxWidth={400}
                sizes="(max-width: 768px) 200px, 150px"
                className="max-w-[200px] max-h-[100px] w-auto h-auto object-contain"
              />
            </div>
          {/if}
        {/if}
      {/each}
    </div>
  </div>
  {#if showButton}
    <div class="text-center">
      <div class="w-auto p-2">
        <a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="/aussteller">Aussteller werden</a>
      </div>
    </div>
  {/if}
</div>

<style>
  .logo-container {
    transition: all 0.5s ease-out;
    position: relative;
  }

  .logo-container.highlight {
    background: radial-gradient(circle at center, rgb(178, 230, 0, .02) 0%, transparent 70%);
  }

  .logo-container.highlight::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgb(178, 230, 0);
    animation: pulse 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    20% {
      transform: scale(1.05);
      opacity: 0.9;
    }
    60% {
      transform: scale(1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1.02);
      opacity: 0;
    }
  }
</style>
