<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { MenuItems } from '$lib/types/menu';

  export let isOpen = false;
  export let menuItems: MenuItems;

  let activeSubmenu: string | null = 'workshops'; // Set workshops as default open menu

  function handleClose() {
    isOpen = false;
  }

  function toggleSubmenu(key: string) {
    activeSubmenu = activeSubmenu === key ? null : key;
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black lg:hidden overflow-hidden z-[205]"
    transition:fade={{ duration: 200 }}
  >
    <!-- Scrollable Container -->
    <div class="h-full overflow-y-auto">
      
      <div class="container mx-auto px-4 py-4 pt-4">
        <!-- Close Button -->
        <div class="flex justify-between mb-6">
          <a href="/" class="relative z-[110] s-OTmmHBhb3fXp"><img src="/assets/logo.svg" alt="DJ Workshop Germany" class="h-12 s-OTmmHBhb3fXp"></a> 
          <button 
            class="text-white/80 hover:text-white"
            on:click={handleClose}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div> 

        <!-- Navigation -->
        <nav class="space-y-4">
          {#each Object.entries(menuItems) as [key, menu]}
            <div class="border-b border-gray-800 pb-4">
              <!-- Main Menu Button -->
              <button
                class="w-full flex items-center justify-between text-left mb-2"
                on:click={() => toggleSubmenu(key)}
              >
                <span class="font-heading text-xl text-white font-medium">{menu.title}</span>
                <svg
                  class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                  class:rotate-180={activeSubmenu === key}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Submenu Content -->
              {#if activeSubmenu === key}
                <div transition:slide={{ duration: 200 }}>
                  <!-- Featured Content (only for first menu item) -->
                  {#if key === 'workshops'}
                    <a 
                      href={menu.featured.link}
                      class="block mb-6 group"
                      on:click={handleClose}
                    >
                      <div class="relative rounded-2xl overflow-hidden mb-3 aspect-video">
                        <img 
                          src={menu.featured.image} 
                          alt={menu.featured.title}
                          class="w-full h-full object-cover"
                        >
                        <div class="absolute inset-0 bg-black/40"></div>
                      </div>
                      <h4 class="text-white font-medium group-hover:text-green-500 transition-colors duration-200">
                        {menu.featured.title}
                      </h4>
                      <p class="text-sm text-gray-400 mt-1">
                        {menu.featured.description}
                      </p>
                    </a>
                  {/if}

                  <!-- Menu Items -->
                  {#each menu.columns as column}
                    <div class="mb-6">
                      <h4 class="text-sm text-green-500 font-medium mb-3">{column.title}</h4>
                      <ul class="space-y-3">
                        {#each column.items as item}
                          <li>
                            <a 
                              href={item.link} 
                              class="block text-gray-300 hover:text-white transition-colors duration-200"
                              on:click={handleClose}
                            >
                              {item.label}
                            </a>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/each}

                  <!-- Quick Links -->
                  <div class="pt-4">
                    <h4 class="text-sm text-green-500 font-medium mb-3">Quick Links</h4>
                    <ul class="space-y-3">
                      {#each menu.quickLinks as link}
                        <li>
                          <a 
                            href={link.link} 
                            class="block text-gray-300 hover:text-white transition-colors duration-200"
                            on:click={handleClose}
                          >
                            {link.label}
                          </a>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </nav>

        <!-- Action Button -->
        <div class="mt-8 sticky bottom-6">
          <a 
            href="/events" 
            class="block w-full text-center px-6 py-3 text-black bg-green-500 hover:bg-green-600 rounded-full transition-colors duration-200"
            on:click={handleClose}
          >
            Tickets buchen
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Ensure proper scrolling on iOS */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
  }
</style>
