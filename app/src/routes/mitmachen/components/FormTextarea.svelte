
<script>
  export let id = '';
  export let label = '';
  export let value = '';
  export let placeholder = '';
  export let helpText = '';
  export let required = false;
  export let error = '';
  export let rows = 4;
</script>

<div class="space-y-2">
  <label for={id} class="block text-sm font-medium text-gray-300">{label}</label>
  {#if helpText}
    <p class="text-sm text-gray-400 mb-2">{helpText}</p>
  {/if}
  <div class="relative">
    <textarea 
      {id}
      name={id}
      bind:value
      {rows}
      class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
      class:border-red-500={error}
      style="min-height: {rows * 24}px"
      {placeholder}
      {required}
    ></textarea>
  </div>
  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}
</div>