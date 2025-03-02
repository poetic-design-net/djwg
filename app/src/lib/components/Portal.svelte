<!-- $lib/components/Portal.svelte -->
<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  
  // The target element where the portal content will be mounted
  export let target: HTMLElement | null = null;
  
  let portal: HTMLElement | null = null;
  
  onMount(async () => {
    if (browser && target) {
      // Create portal container
      portal = document.createElement('div');
      portal.className = 'portal-content';
      
      // Append to target
      target.appendChild(portal);
      
      // Ensure component is updated
      await tick();
    }
  });
  
  onDestroy(() => {
    // Clean up portal when component is destroyed
    if (browser && portal && target) {
      if (target.contains(portal)) {
        target.removeChild(portal);
      }
      portal = null;
    }
  });
  
  // Update portal target when target changes
  $: if (browser && portal && target) {
    // Remove from old target
    const oldParent = portal.parentNode;
    if (oldParent && oldParent !== target) {
      oldParent.removeChild(portal);
    }
    
    // Add to new target if not already there
    if (!target.contains(portal)) {
      target.appendChild(portal);
    }
  }
</script>

{#if browser && portal}
  <div bind:this={portal}>
    <slot />
  </div>
{/if}