<!-- InfoIcon.svelte -->
<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  
  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let className = '';
  export let variant: 'default' | 'light' = 'default';
  
  // Size mapping
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  $: iconSize = sizeClasses[size];
</script>

<div class="relative {className}">
  <Tooltip {text} {position}>
    <button
      type="button"
      class="group relative inline-flex items-center justify-center {iconSize} {variant === 'light' ? 'text-gray-300/90 hover:text-gray-100' : 'text-green-400/80 hover:text-green-400'} transition-colors focus:outline-none"
    >
      <span class="sr-only">Mehr Informationen</span>
      <!-- Pulsing effect -->
      <span class="absolute inset-0 rounded-full animate-ping-slow {variant === 'light' ? 'bg-gray-300/20 group-hover:bg-gray-100/30' : 'bg-green-400/20 group-hover:bg-green-400/30'}"></span>
      <!-- Icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class={iconSize}>
        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
      </svg>
    </button>
  </Tooltip>
</div>

<style>
  @keyframes ping-slow {
    0% {
      transform: scale(1);
      opacity: 0.1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.2;
    }
    100% {
      transform: scale(1);
      opacity: 0.1;
    }
  }

  .animate-ping-slow {
    animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
</style>