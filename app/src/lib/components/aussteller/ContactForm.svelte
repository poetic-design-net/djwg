<script lang="ts">
  import { fade } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import SimpleLogoUploader from './SimpleLogoUploader.svelte';

  export let form: any;
  
  let isSubmitting = false;
  let uploadedLogoId: string | null = null;
  let logoUploader: SimpleLogoUploader;

  function handleUploadComplete(id: string) {
    uploadedLogoId = id;
  }
</script>

<form 
  method="POST"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      if (form?.success) {
        uploadedLogoId = null;
        logoUploader?.reset();
      }
      isSubmitting = false;
    };
  }}
  class="space-y-6" 
  novalidate
>
  <!-- Logo Upload -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-300">Firmenlogo</label>
    <SimpleLogoUploader 
      bind:this={logoUploader}
      clearAfterSubmit={true}
      onUploadComplete={handleUploadComplete}
    />
    <input type="hidden" name="logoId" value={uploadedLogoId ?? ''}>
  </div>

  <!-- Kontaktinformationen -->
  <div class="grid md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="name" class="block text-sm font-medium text-gray-300">Name / Firma</label>
      <div class="relative">
        <input 
          id="name"
          name="name"
          type="text" 
          value={form?.values?.name ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          class:border-red-500={form?.error}
          placeholder="Dein Name oder Firmenname"
        >
      </div>
    </div>

    <div class="space-y-2">
      <label for="email" class="block text-sm font-medium text-gray-300">E-Mail</label>
      <div class="relative">
        <input 
          id="email"
          name="email"
          type="email" 
          value={form?.values?.email ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          class:border-red-500={form?.error}
          placeholder="Deine E-Mail"
        >
      </div>
    </div>
  </div>

  <!-- Zusätzliche Kontaktinformationen -->
  <div class="grid md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="phone" class="block text-sm font-medium text-gray-300">Telefon</label>
      <div class="relative">
        <input 
          id="phone"
          name="phone"
          type="tel" 
          value={form?.values?.phone ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          placeholder="Deine Telefonnummer"
        >
      </div>
    </div>

    <div class="space-y-2">
      <label for="website" class="block text-sm font-medium text-gray-300">Website</label>
      <div class="relative">
        <input 
          id="website"
          name="website"
          type="url" 
          value={form?.values?.website ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          placeholder="https://www.deine-website.de"
        >
      </div>
    </div>
  </div>

  <!-- Unternehmensinformationen -->
  <div class="grid md:grid-cols-2 gap-6">
    <div class="space-y-2">
      <label for="company" class="block text-sm font-medium text-gray-300">Unternehmen</label>
      <div class="relative">
        <input 
          id="company"
          name="company"
          type="text" 
          value={form?.values?.company ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          placeholder="Name deines Unternehmens"
        >
      </div>
    </div>

    <div class="space-y-2">
      <label for="industry" class="block text-sm font-medium text-gray-300">Branche</label>
      <div class="relative">
        <input 
          id="industry"
          name="industry"
          type="text" 
          value={form?.values?.industry ?? ''}
          class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors"
          placeholder="z.B. DJ Equipment, Software, etc."
        >
      </div>
    </div>
  </div>

  <!-- Produkte/Services -->
  <div class="space-y-2">
    <label for="products" class="block text-sm font-medium text-gray-300">Produkte/Services</label>
    <p class="text-sm text-gray-400 mb-2">Welche Produkte oder Services möchtest du präsentieren?</p>
    <div class="relative">
      <textarea 
        id="products"
        name="products"
        value={form?.values?.products ?? ''}
        class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors min-h-[100px]"
        placeholder="Beschreibe deine Produkte oder Services..."
      ></textarea>
    </div>
  </div>

  <!-- Nachricht -->
  <div class="space-y-2">
    <label for="message" class="block text-sm font-medium text-gray-300">Zusätzliche Informationen</label>
    <p class="text-sm text-gray-400 mb-2">Hast du besondere Anforderungen oder Wünsche für deine Präsentation?</p>
    <div class="relative">
      <textarea 
        id="message"
        name="message"
        value={form?.values?.message ?? ''}
        class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-xl focus:border-white focus:outline-none transition-colors min-h-[150px]"
        class:border-red-500={form?.error}
        placeholder="Deine Nachricht..."
      ></textarea>
    </div>
  </div>

  <div class="flex flex-col items-center space-y-4">
    <button 
      type="submit" 
      class="px-14 py-4 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        Wird gesendet...
      {:else}
        Anfrage senden
      {/if}
    </button>

    {#if form?.error}
      <p class="text-red-500" transition:fade>{form.error}</p>
    {/if}

    {#if form?.success}
      <p class="text-green-400" transition:fade>Vielen Dank für deine Anfrage! Wir melden uns in Kürze bei dir.</p>
    {/if}

    <p class="text-sm text-gray-300 max-w-xs text-center">
      Deine Daten werden gemäß unserer Datenschutzrichtlinien verwendet.
    </p>
  </div>
</form>