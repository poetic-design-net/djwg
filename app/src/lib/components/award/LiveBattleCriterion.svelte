<script lang="ts">
  export let title: string;
  export let description: string;
  export let isActive: boolean;
  export let index: number;
  export let isLast: boolean;
</script>

<div
  class="criteria-item"
  class:is-sticky={!isLast}
  role="listitem"
  aria-labelledby="criterion-{index}-title"
  aria-describedby="criterion-{index}-description"
  tabindex="0"
>
  <div
    class="w-full max-w-2xl mx-auto p-6 rounded-xl bg-white/[0.03] text-left transition-all duration-700 ease-out"
    style="opacity: {isActive ? '1' : '0.3'}; transform: scale({isActive ? '1' : '0.98'}) translateY({isActive ? '0' : '10px'});"
  >
    <div class="flex items-start gap-4">
      <div class="w-10 h-10 flex items-center justify-center rounded-xl text-purple-400">
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div>
        <h4 id="criterion-{index}-title" class="text-lg font-medium text-gray-200 mb-2">
          {title}
        </h4>
        <p id="criterion-{index}-description" class="text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .criteria-item {
    min-height: 12vh;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10vh;
    position: relative;
    z-index: 1;
  }

  .criteria-item:first-child {
    margin-top: 20vh;
  }

  .is-sticky {
    position: sticky;
    top: 50vh;
    transform: translateY(-50%);
  }
</style>