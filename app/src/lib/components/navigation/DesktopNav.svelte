<script lang="ts">
  import type { MenuItems, MenuKey } from '$lib/types/menu';
  import { buildNavigationHref } from '$lib/utils/navigation';

  export let menuItems: MenuItems;
  export let activeMenu: MenuKey | null;
  export let onClick: (menu: MenuKey) => void;
  export let pages: Record<string, { slug: { current: string } }> | undefined = undefined;

  function handleItemClick(key: string, menu: any) {
    if (menu.type === 'direct') {
      const href = buildNavigationHref(menu, pages);
      if (href) {
        window.location.href = href;
      } else {
        console.error('No href found for direct link:', menu);
      }
    } else {
      onClick(key as MenuKey);
    }
  }
</script>

<nav class="flex items-center space-x-8">
  {#each Object.entries(menuItems) as [key, menu]}
    {#if menu}
      <div class="relative">
        <button 
          class="font-heading text-white font-medium hover:text-green-500 transition-colors duration-200 py-8"
          class:text-green-500={activeMenu === key}
          on:click={() => handleItemClick(key, menu)}
        >
          {menu.title}
        </button>
      </div>
    {/if}
  {/each}
</nav>

<style>
  button {
    text-align: left;
  }
</style>
