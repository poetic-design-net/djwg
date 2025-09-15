<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  export let targetDate: string | Date;
  export let onComplete: (() => void) | null = null;
  export let label: string = 'Registrierung öffnet in';
  export let completedLabel: string = 'Registrierung ist jetzt möglich!';
  export let showSeconds: boolean = true;
  export let compact: boolean = false;

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let isComplete = false;
  let interval: ReturnType<typeof setInterval> | null = null;

  function calculateTimeRemaining() {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      days = 0;
      hours = 0;
      minutes = 0;
      seconds = 0;

      // Call onComplete before setting isComplete to true
      if (!isComplete && onComplete) {
        onComplete();
      }

      isComplete = true;

      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      return;
    }

    days = Math.floor(difference / (1000 * 60 * 60 * 24));
    hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((difference % (1000 * 60)) / 1000);
  }

  onMount(() => {
    calculateTimeRemaining();
    interval = setInterval(calculateTimeRemaining, 1000);
  });

  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  $: hasTime = days > 0 || hours > 0 || minutes > 0 || seconds > 0;
</script>

{#if !isComplete && hasTime}
  <div class="countdown-timer {compact ? 'countdown-compact' : ''}" in:fade={{ duration: 300 }}>
    {#if !compact}
      <p class="countdown-label text-sm text-gray-400 mb-3">{label}</p>
    {/if}

    <div class="countdown-display flex items-center gap-2 {compact ? 'text-sm' : ''}">
      {#if days > 0}
        <div class="countdown-unit">
          <span class="countdown-value {compact ? 'text-lg' : 'text-2xl'} font-bold text-green-400">
            {String(days).padStart(2, '0')}
          </span>
          <span class="countdown-unit-label text-xs text-gray-500 ml-1">
            {days === 1 ? 'Tag' : 'Tage'}
          </span>
        </div>
        <span class="text-gray-600">:</span>
      {/if}

      <div class="countdown-unit">
        <span class="countdown-value {compact ? 'text-lg' : 'text-2xl'} font-bold text-green-400">
          {String(hours).padStart(2, '0')}
        </span>
        <span class="countdown-unit-label text-xs text-gray-500 ml-1">
          {hours === 1 ? 'Std' : 'Std'}
        </span>
      </div>
      <span class="text-gray-600">:</span>

      <div class="countdown-unit">
        <span class="countdown-value {compact ? 'text-lg' : 'text-2xl'} font-bold text-green-400">
          {String(minutes).padStart(2, '0')}
        </span>
        <span class="countdown-unit-label text-xs text-gray-500 ml-1">Min</span>
      </div>

      {#if showSeconds && !compact}
        <span class="text-gray-600">:</span>
        <div class="countdown-unit">
          <span class="countdown-value {compact ? 'text-lg' : 'text-2xl'} font-bold text-green-400 transition-all duration-500">
            {String(seconds).padStart(2, '0')}
          </span>
          <span class="countdown-unit-label text-xs text-gray-500 ml-1">Sek</span>
        </div>
      {/if}
    </div>

    {#if compact && days === 0 && hours === 0 && minutes < 30}
      <div class="mt-2" transition:fade={{ duration: 200 }}>
        <span class="text-xs text-yellow-400 animate-pulse">Bald verfügbar!</span>
      </div>
    {/if}
  </div>
{:else if isComplete}
  <div class="countdown-complete" in:fade={{ duration: 300 }}>
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span class="text-green-400 font-medium {compact ? 'text-sm' : ''}">{completedLabel}</span>
    </div>
  </div>
{/if}

<style>
  .countdown-timer {
    @apply text-center;
  }

  .countdown-compact {
    @apply inline-flex flex-col items-center;
  }

  .countdown-unit {
    @apply flex items-baseline;
  }

  .countdown-value {
    @apply tabular-nums;
    font-variant-numeric: tabular-nums;
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .countdown-complete {
    animation: pulse-glow 2s ease-in-out infinite;
  }
</style>