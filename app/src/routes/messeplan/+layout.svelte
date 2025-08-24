<script lang="ts">
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  
  let headerHeight = 64 // Default header height
  
  onMount(() => {
    if (browser) {
      // Get actual header height
      const header = document.querySelector('header')
      if (header) {
        headerHeight = header.offsetHeight
      }
    }
  })
</script>

<div 
  class="fixed inset-0 bg-gray-50" 
  style="top: {headerHeight}px; height: calc(100vh - {headerHeight}px)"
>
  <slot />
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
</style>