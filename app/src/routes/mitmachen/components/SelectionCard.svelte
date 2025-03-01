<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  
  export let data: {
    title: string;
    description: string;
    benefits?: { title: string; description: string }[];
  };
  export let selected = false;
  export let buttonText = 'Auswählen';
  export let selectedButtonText = 'Ausgewählt';
  
  const dispatch = createEventDispatcher<{ select: void }>();
  
  function handleClick() {
    if (!selected) {
      dispatch('select');
    }
  }

  // Benefits formatieren - Titel und Beschreibung getrennt
  $: benefitsText = data.benefits?.map(b => `• ${b.title}\n  ${b.description}`).join('\n\n') || '';
</script>

<div 
  class="relative p-8 rounded-3xl border-2 transition-all cursor-pointer {selected ? 'border-green-400 bg-green-400/10' : 'border-gray-900 hover:border-gray-700 bg-gray-950'}"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="flex items-start justify-between mb-4">
    <h3 class="text-xl font-medium text-white">{data.title}</h3>
    {#if data.benefits && data.benefits.length > 0}
      <InfoIcon 
        text={benefitsText}
        position="right"
        size="lg"
        className="ml-2"
      />
    {/if}
  </div>

  <p class="text-gray-400 mb-6">{data.description}</p>
  
  <button 
    type="button" 
    class="w-full py-3 text-center text-white border-2 border-green-400 rounded-full hover:bg-green-400 hover:text-black transition-colors"
  >
    {selected ? selectedButtonText : buttonText}
  </button>
</div>