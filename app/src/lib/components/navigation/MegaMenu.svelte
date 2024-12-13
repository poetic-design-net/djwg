<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { MenuItems, MenuKey } from '$lib/types/menu';

  export let activeMenu: MenuKey | null;
  export let menuItems: MenuItems;
  export let onClose: () => void;

  let megaMenuContainer: HTMLDivElement;

  $: activeMenuItem = activeMenu ? menuItems[activeMenu] : null;
  $: console.log('MegaMenu activeMenuItem:', activeMenuItem);
</script>

{#if activeMenu}
  <div 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[90]"
    style="top: 80px;"
    on:click={onClose}
    transition:fade={{ duration: 200 }}
  ></div>
{/if}

{#if activeMenuItem}
  <div 
    bind:this={megaMenuContainer}
    class="absolute top-full left-0 w-full bg-black/95 border-t border-b border-gray-800/50 backdrop-blur-sm z-[95]"
    transition:slide={{ duration: 200, easing: quintOut }}
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
              href={activeMenuItem.featured.link} 
              class="block group"
              on:click={onClose}
            >
              <div class="relative rounded-2xl overflow-hidden mb-4 aspect-video">
                <img 
                  src={activeMenuItem.featured.image} 
                  alt={activeMenuItem.featured.title}
                  class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                >
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
              </div>
              <div class="flex items-center gap-2">
                {#if activeMenuItem.featured.linkType === 'anchor'}
                  <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200">#</span>
                {:else}
                  <span class="text-green-500/0 group-hover:text-green-500 transition-colors duration-200">→</span>
                {/if}
                <h3 class="font-heading text-xl text-white group-hover:text-green-400 transition duration-200">
                  {activeMenuItem.featured.title}
                </h3>
              </div>
              <p class="text-gray-400 group-hover:text-gray-300 transition duration-200 mt-2">
                {activeMenuItem.featured.description}
              </p>
            </a>
          </div>
        {/if}

        <!-- Menu Columns -->
        {#if activeMenuItem.columns}
          {#each activeMenuItem.columns as column}
            <div class="col-span-2">
              <h4 class="font-heading text-sm text-green-400 font-medium mb-3">{column.title}</h4>
              <ul class="space-y-2">
                {#each column.items as item}
                  <li>
                    <a 
                      href={item.link} 
                      class="group flex items-center font-heading text-gray-300 hover:text-white transition duration-200"
                      on:click={onClose}
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
        {#if activeMenuItem.quickLinks?.length > 0}
          <div class="col-span-2">
            <h4 class="font-heading text-sm text-green-400 font-medium mb-3">Quick Links</h4>
            <ul class="space-y-2">
              {#each activeMenuItem.quickLinks as link}
                <li>
                  <a 
                    href={link.link} 
                    class="group flex items-center font-heading text-gray-300 hover:text-white transition duration-200"
                    on:click={onClose}
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
