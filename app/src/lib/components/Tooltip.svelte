<!-- $lib/components/Tooltip.svelte -->
<script lang="ts">
  import { onMount, onDestroy, tick, getContext } from 'svelte';
  import { browser } from '$app/environment';
  import { tooltipPortal } from './tooltipPortal';
  import Portal from '$lib/components/Portal.svelte';
  
  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  let tooltipVisible = false;
  let tooltipElement: HTMLDivElement;
  let containerElement: HTMLDivElement;
  
  // Format text if it contains newlines
  $: isFormattedText = text.includes('\n\n');
  $: tooltipItems = isFormattedText
    ? text.split('\n\n').map(item => {
        const parts = item.split('\n ');
        return {
          title: parts[0].replace('• ', ''),
          description: parts[1] || ''
        };
      })
    : [{ title: text, description: '' }];
  
  async function showTooltip() {
    tooltipVisible = true;
    await Promise.all([tick(), new Promise(resolve => requestAnimationFrame(resolve))]);
    if (browser) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
  }
  
  function hideTooltip() {
    tooltipVisible = false;
    if (browser) {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    }
  }
  
  function updatePosition() {
    if (!tooltipVisible || !tooltipElement || !containerElement) return;
    
    const rect = containerElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    // Calculate position based on the position prop
    let top, left;
    
    if (position === 'top') {
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      top = rect.top - tooltipRect.height - 4;
    } else if (position === 'bottom') {
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      top = rect.bottom + 4;
    } else if (position === 'left') {
      left = rect.left - tooltipRect.width - 4;
      top = rect.top + rect.height / 2 - tooltipRect.height / 2;
    } else { // right
      left = rect.right + 4;
      top = rect.top;
    }
    
    // Prevent tooltip from going off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Horizontal adjustments
    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    
    // Vertical adjustments
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }
    
    // Apply the positioning
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
    
    // Position the arrow
    const arrow = tooltipElement.querySelector('.tooltip-arrow') as HTMLElement;
    if (arrow) {
      // Reset arrow positioning
      arrow.style.top = 'auto';
      arrow.style.right = 'auto';
      arrow.style.bottom = 'auto';
      arrow.style.left = 'auto';
      
      if (position === 'top') {
        arrow.style.bottom = '-5px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        arrow.style.borderRight = '1px solid var(--border-color, #374151)';
        arrow.style.borderBottom = '1px solid var(--border-color, #374151)';
      } else if (position === 'bottom') {
        arrow.style.top = '-5px';
        arrow.style.left = '50%';
        arrow.style.transform = 'translateX(-50%) rotate(45deg)';
        arrow.style.borderLeft = '1px solid var(--border-color, #374151)';
        arrow.style.borderTop = '1px solid var(--border-color, #374151)';
      } else if (position === 'left') {
        arrow.style.right = '-5px';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%) rotate(45deg)';
        arrow.style.borderTop = '1px solid var(--border-color, #374151)';
        arrow.style.borderRight = '1px solid var(--border-color, #374151)';
      } else { // right
        arrow.style.left = '-5px';
        arrow.style.top = '50%';
        arrow.style.transform = 'translateY(-50%) rotate(45deg)';
        arrow.style.borderBottom = '1px solid var(--border-color, #374151)';
        arrow.style.borderLeft = '1px solid var(--border-color, #374151)';
      }
    }
  }
  
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    }
  });
</script>

<!-- Tooltip trigger container -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  bind:this={containerElement}
  class="relative inline-flex items-center"
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focus={showTooltip}
  on:blur={hideTooltip}
>
  <slot />
</div>

<!-- Tooltip content through portal -->
{#if tooltipVisible && browser}
  <Portal target={$tooltipPortal}>
    <div 
      bind:this={tooltipElement}
      class="tooltip fixed pointer-events-auto z-[99999]"
    >
      <div 
        class="tooltip-content p-2.5 rounded-lg bg-gray-950/95 backdrop-blur-sm border border-gray-700 text-gray-300 text-sm shadow-xl min-w-[120px] max-w-[260px] leading-snug transition-opacity duration-150"
      >
        {#if isFormattedText}
          {#each tooltipItems as item}
            <div class="mb-2 last:mb-0">
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                </svg>
                <span class="font-medium">{item.title}</span>
              </div>
              {#if item.description}
                <div class="pl-7 text-gray-400 mt-1">
                  {item.description}
                </div>
              {/if}
            </div>
          {/each}
        {:else}
          <span class="block text-left">{text}</span>
        {/if}
      </div>
       </div>
  </Portal>
{/if}

<style>
  :global(.tooltip-portal) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    overflow: visible;
    pointer-events: none;
    z-index: 99990;
  }
  
  .tooltip-content {
    --border-color: rgba(55, 65, 81, 1);
  }
  
  .tooltip-arrow {
    --border-color: rgba(55, 65, 81, 1);
    pointer-events: none;
  }
</style>