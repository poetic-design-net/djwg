<script lang="ts">
  import type { MenuItems } from '$lib/types/menu';
  import { onMount } from 'svelte';
  import { buildNavigationHref } from '$lib/utils/navigation';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';

  export let menuItems: MenuItems;
  export let activeMenu: string | null;
  export let onClick: (menu: string) => void;
  export let pages: Record<string, any> | undefined = undefined;

  // Behandelt Klicks auf Menüpunkte
  function handleItemClick(menu: any) {
    // Immer zuerst das aktive Megamenü schließen
    onClick('');
    if (menu.type === 'direct') {
    } else if (menu.type === 'megamenu') {
      // Toggle Megamenü beim Klick
      onClick(activeMenu === menu._id ? '' : menu._id);
    } else {
      onClick(menu._id);
    }
  }

  // Schließt das Menü beim Klicken außerhalb
  function handleClickOutside(event: MouseEvent) {
    if (activeMenu) {
      const target = event.target as HTMLElement;
      const navElement = document.querySelector('nav');
      if (navElement && !navElement.contains(target)) {
        onClick('');
      }
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<nav class="flex items-center space-x-8">
  {#each menuItems as menu}
    <div
      class="relative"
    >
      {#if menu.type === 'direct'}
        {@const href = buildNavigationHref(menu, pages)}
        <a
          {href}
          class="font-heading text-white font-medium hover:text-green-500 transition-colors duration-200 py-8 block"
          class:text-green-500={activeMenu === menu._id}
          target={href?.startsWith('http') ? '_blank' : undefined}
          on:click|preventDefault={(e) => {
            handleItemClick(menu);
            if (href) window.location.href = href;
          }}
        >
          {menu.title}
        </a>
      {:else}
        <button
          class="font-heading text-white font-medium hover:text-green-500 transition-colors duration-200 py-8"
          class:text-green-500={activeMenu === menu._id}
          on:click={() => handleItemClick(menu)}
        >
          {menu.title}
        </button>
      {/if}

      {#if menu.type === 'megamenu' && activeMenu === menu._id}
        <div class="absolute left-0 w-screen max-w-7xl bg-black/95 backdrop-blur-sm rounded-lg shadow-lg mt-2 p-8 grid grid-cols-12 gap-8 z-50">
          {#if menu.featured}
            <div class="col-span-4">
              <h3 class="text-xl font-heading font-medium text-white mb-4">{menu.featured.title}</h3>
              <p class="text-gray-300 mb-4">{menu.featured.description}</p>
              {#if menu.featured.image}
                <div class="aspect-video rounded-lg overflow-hidden mb-4">
                  <OptimizedImage
                    image={menu.featured.image}
                    maxWidth={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              {/if}
              {#if menu.featured.link}
                <a
                  href={menu.featured.link}
                  class="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mehr erfahren
                </a>
              {/if}
            </div>
          {/if}

          {#if menu.columns}
            <div class="col-span-6 grid grid-cols-2 gap-8">
              {#each menu.columns as column}
                <div>
                  <h4 class="font-heading font-medium text-white mb-4">{column.title}</h4>
                  <ul class="space-y-2">
                    {#each column.items as item}
                      <li>
                        <a
                          href={item.link}
                          class="text-gray-300 hover:text-green-500 transition-colors"
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

          {#if menu.quickLinks}
            <div class="col-span-2">
              <h4 class="font-heading font-medium text-white mb-4">Quick Links</h4>
              <ul class="space-y-2">
                {#each menu.quickLinks as link}
                  <li>
                    <a
                      href={link.link}
                      class="text-gray-300 hover:text-green-500 transition-colors"
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
    </div>
  {/each}
</nav>

<style>
  button {
    text-align: left;
  }
</style>
