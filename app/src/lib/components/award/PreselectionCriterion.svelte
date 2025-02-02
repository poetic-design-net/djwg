<script lang="ts">
  export let title: string;
  export let description: string;
  export let percentage: number;
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = tweened(0, {
    duration: 1000,
    easing: cubicOut
  });

  onMount(() => {
    progress.set(percentage);
  });
</script>

<div class="group mb-6">
  <div class="flex justify-between mb-4">
    <div class="flex items-start gap-4">
      <div class="w-10 h-10 flex items-center justify-center text-purple-400">
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div>
        <span class="text-lg font-medium text-gray-200">{title}</span>
        <p class="text-gray-400 mt-1">{description}</p>
      </div>
    </div>
    <span class="text-xl font-medium text-green-400">
      {$progress.toFixed(0)}%
    </span>
  </div>
  <div class="h-2 bg-white/[0.02] rounded-full overflow-hidden">
    <div
      class="h-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-700 relative"
      style="width: {$progress}%"
    >
      <div class="absolute inset-0 bg-green-500/20 animate-pulse"></div>
    </div>
  </div>
</div>