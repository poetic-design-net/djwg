<script lang="ts">
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let icon: string | undefined = undefined;
  export let initiallyOpen = false;
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();
  let isOpen = initiallyOpen;

  export function open() {
    isOpen = true;
  }

  function handleClick() {
    isOpen = !isOpen;
    dispatch('toggle', { isOpen, id });
  }
</script>

<div class="relative rounded-3xl border border-gray-800 overflow-hidden" id={id}>
  <div class="absolute inset-0 mix-blend-overlay"></div>
  <div class="relative">
    <button
      class="w-full p-8 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors duration-200"
      on:click={handleClick}
    >
      <div class="flex items-center gap-3 group">
        {#if icon}
          <img src={icon} alt="" class="w-6 h-6 object-contain" />
        {/if}
        <h2 class="text-2xl font-medium text-white">{title}</h2>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 transform text-green-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if isOpen}
      <div transition:slide>
        <div class="px-8 pb-8">
          <slot />
        </div>
      </div>
    {/if}
  </div>
</div>

