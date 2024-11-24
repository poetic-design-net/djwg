<script lang="ts">
  import type { MenuItems, MenuKey } from '$lib/types/menu';

  export let menuItems: MenuItems;
  export let activeMenu: MenuKey | null;
  export let onClick: (menu: MenuKey) => void;

  const menuKeys: MenuKey[] = ['workshops', 'join', 'about'];

  $: console.log('DesktopNav received menuItems:', menuItems);
</script>

<nav class="flex items-center space-x-8">
  {#each menuKeys as key}
    {#if menuItems[key]}
      <div class="relative">
        <button 
          class="font-heading text-white font-medium hover:text-green-500 transition-colors duration-200 py-8"
          class:text-green-500={activeMenu === key}
          on:click={() => onClick(key)}
        >
          {menuItems[key]?.title || key}
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
