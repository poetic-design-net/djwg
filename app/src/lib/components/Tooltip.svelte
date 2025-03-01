<script lang="ts">
  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  let tooltipVisible = false;
  let tooltipElement: HTMLDivElement;

  function showTooltip() {
    tooltipVisible = true;
  }

  function hideTooltip() {
    tooltipVisible = false;
  }

  // Verarbeite den Text, um Titel und Beschreibung zu trennen
  $: tooltipItems = text.split('\n\n').map(item => {
    const parts = item.split('\n  ');
    return {
      title: parts[0].replace('• ', ''),
      description: parts[1] || ''
    };
  });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="relative inline-block"
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focus={showTooltip}
  on:blur={hideTooltip}
>
  <slot />
  
  {#if tooltipVisible}
    <div
      bind:this={tooltipElement}
      class="absolute z-50 p-6 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-base whitespace-pre-wrap shadow-xl {
        position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
        position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
        position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
        'left-full top-1/2 -translate-y-1/2 ml-2'
      }"
      role="tooltip"
    >
      <div class="">
        {#each tooltipItems as item}
          <div>
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">{item.title}</span>
            </div>
            {#if item.description}
              <div class="pl-7 -mt-2">
                <span class="text-gray-400">{item.description}</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      
      <!-- Pfeil -->
      <div class="
        absolute w-2 h-2 bg-gray-900 border-gray-800
        transform rotate-45
        {
          position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' :
          position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' :
          position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' :
          'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l'
        }
      ">
      </div>
    </div>
  {/if}
</div>

<style>
  div[role="tooltip"] {
    max-width: 32rem;
    min-width: 24rem;
  }
</style>