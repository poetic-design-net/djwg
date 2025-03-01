<script lang="ts">
  import type { FormFieldProps } from './types';

  export let label: string;
  export let name: string;
  export let type: 'text' | 'email' | 'tel' | 'textarea' = 'text';
  export let value = '';
  export let placeholder = '';
  export let required = false;
  export let error: string | undefined = undefined;
  export let id = `field-${name}`;

  // Prefix für bestimmte Felder (z.B. @ für Social Media)
  let prefix = '';
  if (name === 'instagram') prefix = '@';
  if (name === 'soundcloud') prefix = 'soundcloud.com/';

  // Funktion zur Input-Validierung
  function validateInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (required && !target.value) {
      error = 'Dieses Feld ist erforderlich';
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

  <div class="relative">
    {#if prefix}
      <span class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500">
        {prefix}
      </span>
    {/if}

    {#if type === 'textarea'}
      <textarea
        {id}
        {name}
        bind:value
        on:blur={validateInput}
        {required}
        rows="4"
        class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors resize-none"
        {placeholder}
      ></textarea>
    {:else if type === 'email'}
      <input
        {id}
        {name}
        type="email"
        bind:value
        on:blur={validateInput}
        {required}
        class="w-full {prefix ? 'pl-12' : ''} px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
        {placeholder}
      />
    {:else if type === 'tel'}
      <input
        {id}
        {name}
        type="tel"
        bind:value
        on:blur={validateInput}
        {required}
        class="w-full {prefix ? 'pl-12' : ''} px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
        {placeholder}
      />
    {:else}
      <input
        {id}
        {name}
        type="text"
        bind:value
        on:blur={validateInput}
        {required}
        class="w-full {prefix ? 'pl-12' : ''} px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
        {placeholder}
      />
    {/if}
  </div>

  {#if error}
    <p class="mt-2 text-sm text-red-500 absolute -bottom-6">{error}</p>
  {/if}
</div>
