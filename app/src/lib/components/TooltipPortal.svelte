<!-- $lib/components/TooltipPortal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { tooltipPortal } from './tooltipPortal';
  
  onMount(() => {
    if (browser) {
      // Check if portal already exists
      let portal = document.getElementById('tooltip-portal');
      
      if (!portal) {
        // Create portal container
        portal = document.createElement('div');
        portal.id = 'tooltip-portal';
        portal.className = 'tooltip-portal';
        
        // Apply styles
        Object.assign(portal.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '0',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: '99999' // Very high z-index
        });
        
        document.body.appendChild(portal);
      }
      
      // Update the store with the portal element
      tooltipPortal.set(portal);
    }
  });

  onDestroy(() => {
    // Reset the store, but don't remove the portal from DOM
    // as other components might still need it
    if (browser) {
      tooltipPortal.set(null);
    }
  });
</script>

<!-- No visible content -->