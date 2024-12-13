<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { MenuItems } from '$lib/types/menu';

  export let isOpen = false;
  export let menuItems: MenuItems;

  function handleLinkClick() {
    isOpen = false;
    document.body.style.overflow = '';
  }

  $: console.log('MobileMenu received menuItems:', menuItems);
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black/95 z-[100] lg:hidden overflow-y-auto pb-24"
    transition:slide={{ duration: 300 }}
  >
    <div class="container mx-auto px-4 py-20">
      <nav class="space-y-8">
        {#each Object.entries(menuItems) as [key, menu]}
          {#if menu}
            <div>
              <h3 class="text-green-500 font-heading text-lg mb-4">{menu.title}</h3>
              
              <!-- Featured Content -->
              {#if menu.featured}
                <a 
                  href={menu.featured.link}
                  class="block mb-6 group"
                  on:click={handleLinkClick}
                >
                  <div class="relative rounded-xl overflow-hidden mb-3 aspect-video">
                    <img 
                      src={menu.featured.image} 
                      alt={menu.featured.title}
                      class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    >
                    <div class="absolute inset-0 bg-black/40"></div>
                  </div>
                  <h4 class="text-white font-heading text-lg mb-1 group-hover:text-green-500 transition duration-200">
                    {menu.featured.title}
                  </h4>
                  <p class="text-gray-400 text-sm">
                    {menu.featured.description}
                  </p>
                </a>
              {/if}

              <!-- Menu Items -->
              {#if menu.columns}
                <div class="space-y-6">
                  {#each menu.columns as column}
                    <div>
                      <h4 class="text-green-500 font-heading text-sm mb-3">{column.title}</h4>
                      <ul class="space-y-3">
                        {#each column.items as item}
                          <li>
                            <a 
                              href={item.link}
                              class="text-gray-300 hover:text-white transition duration-200"
                              on:click={handleLinkClick}
                            >
                              {item.label}
                            </a>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- Quick Links -->
              {#if menu.quickLinks?.length > 0}
                <div class="mt-6">
                  <h4 class="text-green-500 font-heading text-sm mb-3">Quick Links</h4>
                  <ul class="space-y-3">
                    {#each menu.quickLinks as link}
                      <li>
                        <a 
                          href={link.link}
                          class="text-gray-300 hover:text-white transition duration-200"
                          on:click={handleLinkClick}
                        >
                          {link.label}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </nav>
    </div>

    <!-- Fixed Tickets Button -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-black/95 border-t border-gray-800 z-[110]">
      <div class="container mx-auto">
        <a 
          href="/events" 
          class="block w-full text-center font-heading font-medium px-6 py-4 text-black bg-green-500 hover:bg-green-600 rounded-full transition duration-200"
          on:click={handleLinkClick}
        >
          Tickets buchen
        </a>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .overflow-y-auto {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
</style>
