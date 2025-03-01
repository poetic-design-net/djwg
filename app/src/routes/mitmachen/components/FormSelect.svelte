<script lang="ts">
  import type { ExperienceLevel } from './types';

  export let label: string;
  export let name: string;
  export let value = '';
  export let required = false;
  export let error: string | undefined = undefined;
  export let options: ExperienceLevel[] = [];
  export let id = `field-${name}`;

  function validateSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (required && !target.value) {
      error = 'Bitte wähle eine Option aus';
    } else {
      error = undefined;
    }
  }
</script>

<div class="mb-6 relative">
  <label for={id} class="block mb-2 text-sm font-medium text-gray-300">
    {label}
    {#if required}<span class="text-red-500">*</span>{/if}
  </label>

  <select
    {id}
    {name}
    bind:value
    on:blur={validateSelect}
    {required}
    class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors appearance-none cursor-pointer"
  >
    <option value="">Bitte wählen...</option>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>

  <!-- Custom Select Arrow -->
  <div class="pointer-events-none absolute right-6 top-[53px] transform -translate-y-1/2">
    <svg class="h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
  </div>

  {#if error}
    <p class="mt-2 text-sm text-red-500 absolute -bottom-6">{error}</p>
  {/if}
</div>
