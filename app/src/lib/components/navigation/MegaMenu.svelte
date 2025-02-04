<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import type { MenuItems } from '$lib/types/menu';
  import type { MenuLink } from '$lib/sanity/queries/navigation';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';

  export let activeMenu: string | null;
  export let menuItems: MenuItems;
  export let onClose: () => void;

  let megaMenuContainer: HTMLDivElement;
  let closeTimeout: NodeJS.Timeout;

  function handleMouseEnter() {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
  }

  function handleMouseLeave() {
    closeTimeout = setTimeout(() => {
      onClose();
    }, 300);
  }

  // Cleanup beim Zerstören der Komponente
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
  });

  const handleLinkClick = async (link: string | undefined, linkType: string | undefined = 'direct') => {
    if (!link) return;
    onClose();

    // Extrahiere Basis-URL und Anker aus dem Link
    const [baseUrl, anchor] = link.split('#');
    const currentPath = window.location.pathname;
    const isCurrentPage = baseUrl === '' || baseUrl === currentPath;

    // Fall 1: Reiner Anker-Link oder Link auf aktueller Seite mit Anker
    if (isCurrentPage && anchor) {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${anchor}`);
      }
      return;
    }

    // Fall 2: Link zu anderer Seite (mit oder ohne Anker)
    try {
      // Navigiere zur neuen Seite
      await goto(baseUrl || '/');
      
      // Nach der Navigation zum Anker scrollen (falls vorhanden)
      if (anchor) {
        // Längere Verzögerung für das Laden der Seite
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // URL aktualisieren
            window.location.hash = anchor;
          }
        }, 500); // Längere Verzögerung
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  $: activeMenuItem = activeMenu ? menuItems.find(item => item._id === activeMenu) : null;
</script>

{#if activeMenu}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[90]"
    style="top: 80px;"
    on:click={onClose}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    transition:fade={{ duration: 200 }}
  ></div>
{/if}

{#if activeMenuItem}
  <!-- Sicherer Bereich für die Maus -->
  <div
    class="absolute top-[calc(100%-8px)] left-0 w-full h-8 z-[94]"
    on:mouseenter={handleMouseEnter}
  />
  
  <div
    bind:this={megaMenuContainer}
    class="absolute top-full left-0 w-full bg-black/95 border-t border-b border-gray-800/50 backdrop-blur-sm z-[95]"
    transition:slide={{ duration: 200, easing: quintOut }}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    <!-- Close Button -->
    <button 
      class="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors duration-200"
      on:click={onClose}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>

    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-12 gap-8">
        <!-- Featured Content -->
        {#if activeMenuItem.featured}
          <div class="col-span-4">
            <a
              href={activeMenuItem.featured?.link}
              class="block group"
              on:click|preventDefault={() => handleLinkClick(activeMenuItem.featured?.link, activeMenuItem.featured?.linkType)}
              data-no-scroll
              data-sveltekit-preload-data
            >
              <div class="relative rounded-2xl overflow-hidden mb-4 aspect-video">
                {#if activeMenuItem.featured.image}
                  <OptimizedImage 
                    image={activeMenuItem.featured.image}
                    maxWidth={400}
                    className="w-full h-full object-cover transform scale-105 transition duration-500"
                  />
                {/if}
                <div class="absolute inset-0 bg-black/30 transition-colors duration-300"></div>
              </div>
              <div class="flex items-center gap-2">
                {#if activeMenuItem.featured.linkType === 'anchor'}
                  <span class="text-green-500 transition-colors duration-200">#</span>
                {:else}
                  <span class="text-green-500 transition-colors duration-200">→</span>
                {/if}
                <h3 class="font-heading text-xl text-green-400 transition duration-200">
                  {activeMenuItem.featured.title}
                </h3>
              </div>
              <p class="text-gray-300 transition duration-200 mt-2">
                {activeMenuItem.featured.description}
              </p>
            </a>
          </div>
        {/if}

        <!-- Menu Columns -->
        {#if activeMenuItem.columns}
          {#each activeMenuItem.columns as column}
            <div class="col-span-2">
              {#if column.link && column.linkType}
               <a
                 href={column.link}
                 class="group block font-heading text-sm text-green-400 hover:text-white font-medium mb-3"
                 on:click|preventDefault={() => handleLinkClick(column.link, column.linkType)}
                 data-no-scroll
                 data-sveltekit-preload-data
               >
                 <div class="flex items-center">
                   {#if column.linkType === 'anchor'}
                     <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">#</span>
                   {:else}
                     <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">→</span>
                   {/if}
                   {column.title}
                 </div>
               </a>
              {:else}
                <h4 class="font-heading text-sm text-green-400 font-medium mb-3">{column.title}</h4>
              {/if}
              <ul class="space-y-2">
                {#each column.items as item}
                  <li>
                    <a
                      href={item.link}
                      class="group flex items-center font-heading text-gray-300 hover:text-white transition duration-200"
                      on:click|preventDefault={() => handleLinkClick(item.link, item.linkType)}
                      data-no-scroll
                      data-sveltekit-preload-data
                    >
                      {#if item.linkType === 'anchor'}
                        <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">#</span>
                      {:else}
                        <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">→</span>
                      {/if}
                      {item.label}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        {/if}

        <!-- Quick Links -->
        {#if activeMenuItem.quickLinks && activeMenuItem.quickLinks.length > 0}
          <div class="col-span-2">
            <h4 class="font-heading text-sm text-green-400 font-medium mb-3">Quick Links</h4>
            <ul class="space-y-2">
              {#each activeMenuItem.quickLinks as link (link.label)}
                <li>
                  <a
                    href={link.link}
                    class="group flex items-center font-heading text-gray-300 hover:text-white transition duration-200"
                    on:click|preventDefault={() => handleLinkClick(link.link, link.linkType)}
                    data-no-scroll
                  >
                    {#if link.linkType === 'anchor'}
                      <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">#</span>
                    {:else}
                      <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200 mr-1">→</span>
                    {/if}
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
