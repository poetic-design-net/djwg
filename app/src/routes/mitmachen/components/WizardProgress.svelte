<script lang="ts">
  export let currentStep: number;
  export let maxSteps: number;
  
  $: progress = (currentStep / maxSteps) * 100;
</script>

<div class="relative mb-8">
  <div class="h-2 bg-gray-800 rounded-full">
    <div
      class="h-full bg-green-400 rounded-full transition-all duration-300"
      style="width: {progress}%"
    ></div>
  </div>
  
  <div class="flex justify-between mt-2 text-sm text-gray-400">
    <span>Schritt {currentStep} von {maxSteps}</span>
    <span>{Math.round(progress)}%</span>
  </div>
</div>