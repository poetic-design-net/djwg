<script lang="ts">
  import { slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import type { MenuItems } from '$lib/types/menu';
  import { navigateToSection } from '$lib/utils/navigation';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  import ScrollButton from './ScrollButton.svelte';

  export let isOpen = false;
  export let menuItems: MenuItems;
  export let pages: Record<string, { slug: string }> | undefined = undefined;

  let expandedMenus: Set<number> = new Set();
  let loading = false;

  function toggleSubmenu(index: number) {
    if (expandedMenus.has(index)) {
      expandedMenus.delete(index);
    } else {
      expandedMenus.add(index);
    }
    expandedMenus = expandedMenus; // Trigger Svelte Reaktivität
  }

  function handleLinkClick() {
    isOpen = false;
    document.body.style.overflow = '';
  }

  async function handleItemClick(menu: any) {
    if (menu.type === 'direct') {
      await navigateToSection(menu, pages);
    }
    handleLinkClick();
  }

  const handleColumnLinkClick = async (link: string | undefined, linkType: string | undefined = 'direct') => {
    if (!link) return;

    // Bei Auth-Links normale Navigation zulassen
    if (link.startsWith('/auth')) {
        loading = true;
        handleLinkClick();
        window.location.href = link;
        return;
      }
    
    const [baseUrl, anchor] = link.split('#');
    const currentPath = window.location.pathname;
    const isCurrentPage = baseUrl === '' || baseUrl === currentPath;

    if (isCurrentPage && anchor) {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', `#${anchor}`);
      }
    } else {
      try {
        await goto(baseUrl || '/');
        if (anchor) {
          setTimeout(() => {
            const element = document.getElementById(anchor);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              window.location.hash = anchor;
            }
          }, 500);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
    handleLinkClick();
  };
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-[100] lg:hidden overflow-y-auto pb-24"
    transition:slide={{ duration: 300 }}
  >
    <div class="fixed inset-0 bg-black/95" />
    <div class="container relative mx-auto px-4 pt-28">
      <!-- Loading Overlay für Auth Navigation -->
      {#if loading}
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-[110]">
          <svg class="animate-spin h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {/if}

      <nav class="space-y-4">
        {#each menuItems as menu, index}
          <div class="border-b border-gray-800 pb-4">
            {#if menu.type === 'direct'}
              <!-- Direct Link -->
              <button
                class="block text-green-500 font-heading text-lg hover:text-white transition duration-200"
                on:click={() => handleItemClick(menu)}
              >
                {menu.title}
              </button>
            {:else}
              <!-- Expandable Menu -->
              <button
                class="flex items-center justify-between w-full text-green-500 font-heading text-lg hover:text-white transition duration-200"
                on:click={() => toggleSubmenu(index)}
              >
                <span>{menu.title}</span>
                <svg
                  class="w-5 h-5 transform transition-transform duration-200 {expandedMenus.has(index) ? 'rotate-180' : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {#if expandedMenus.has(index)}
                <div transition:slide={{ duration: 200 }} class="mt-4 space-y-4">
                  <!-- Featured Content -->
                  {#if menu.featured}
                    <a
                      href={menu.featured.link}
                      class="block mb-6 group"
                      on:click|preventDefault={() => handleColumnLinkClick(menu.featured?.link, menu.featured?.linkType)}
                    >
                      <div class="relative rounded-xl overflow-hidden mb-3 aspect-video">
                        {#if menu.featured.image?._type === 'image' && menu.featured.image?.asset}
                          <OptimizedImage
                            image={menu.featured.image}
                            maxWidth={400}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                          />
                        {/if}
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
                    <div class="space-y-4">
                      {#each menu.columns as column}
                        <div>
                          {#if column.link && column.linkType}
                            <a
                              href={column.link}
                              class="group block font-heading text-sm text-green-500 hover:text-white font-medium mb-2"
                              on:click|preventDefault={() => handleColumnLinkClick(column.link, column.linkType)}
                              data-no-scroll
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
                            <h4 class="text-green-500 font-heading text-sm mb-2">{column.title}</h4>
                          {/if}
                          <ul class="space-y-2 ml-4">
                            {#each column.items as item}
                              <li>
                                <a
                                  href={item.link}
                                  class="text-gray-300 hover:text-white transition duration-200"
                                  on:click|preventDefault={() => handleColumnLinkClick(item.link, item.linkType)}
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
                  {#if menu.quickLinks && menu.quickLinks.length > 0}
                    <div class="mt-4">
                      <h4 class="text-green-500 font-heading text-sm mb-2">Quick Links</h4>
                      <ul class="space-y-2 ml-4">
                        {#each menu.quickLinks as quickLink}
                          <li>
                            <a
                              href={quickLink.link}
                              class="text-gray-300 hover:text-white transition duration-200"
                              on:click|preventDefault={() => handleColumnLinkClick(quickLink.link, quickLink.linkType)}
                            >
                              {quickLink.label}
                            </a>
                          </li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </nav>
    </div>

    <!-- Fixed Tickets Button -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-black/95 border-t border-gray-800 z-[110]">
      <div class="container mx-auto">
        <ScrollButton 
  variant="mobile-link"
  onNavigate={() => handleLinkClick()} 
/>
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
