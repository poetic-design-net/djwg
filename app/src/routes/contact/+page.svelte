<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { PageData } from './types';
  import { enhance } from '$app/forms';
  
  export let data: PageData;
  export let form: any;
  
  const { settings } = data;
  const { contact, socialMedia } = settings;

  let isSubmitting = false;
</script>

<svelte:head>
  <title>Kontakt | {settings.title || 'DJ Workshop'}</title>
  <meta name="description" content={settings.description || 'Kontaktiere uns für Fragen zu unseren DJ Workshops oder für eine Anmeldung.'} />
</svelte:head>

<section class="py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="md:max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop</span>
        <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">Kontaktiere uns</h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">Hast du Fragen zu unseren DJ Workshops oder möchtest du dich anmelden? Dann nutze einfach unser Kontaktformular.</p>
      </div>

      <!-- Contact Information -->
      <div class="grid md:grid-cols-3 gap-8 mb-16 text-center md:text-left">
        {#if contact?.address}
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-2">Adresse</h3>
            <p class="text-gray-300 whitespace-pre-line">{contact.address}</p>
          </div>
        {/if}
        {#if contact?.email}
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-2">E-Mail</h3>
            <a href="mailto:{contact.email}" class="text-green-400 hover:text-green-300 transition-colors">{contact.email}</a>
          </div>
        {/if}
        {#if contact?.phone}
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-2">Telefon</h3>
            <a href="tel:{contact.phone}" class="text-green-400 hover:text-green-300 transition-colors">{contact.phone}</a>
          </div>
        {/if}
      </div>

      <!-- Contact Form -->
      <form 
        method="POST"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            await update();
            isSubmitting = false;
          };
        }}
        class="space-y-6" 
        novalidate
      >
        <div class="grid md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
            <div class="relative">
              <input 
                id="name"
                name="name"
                type="text" 
                value={form?.values?.name ?? ''}
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
                class:border-red-500={form?.error}
                placeholder="Dein Name"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
                class:border-red-500={form?.error}
                placeholder="Deine E-Mail"
              >
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label for="message" class="block text-sm font-medium text-gray-300">Nachricht</label>
          <div class="relative">
            <textarea 
              id="message"
              name="message"
              value={form?.values?.message ?? ''}
              class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors min-h-[150px]"
              class:border-red-500={form?.error}
              placeholder="Deine Nachricht"
            ></textarea>
          </div>
        </div>

        <div class="flex flex-col items-center space-y-4">
          <button 
            type="submit" 
            class="px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              Wird gesendet...
            {:else}
              Senden
            {/if}
          </button>

          {#if form?.error}
            <p class="text-red-500" transition:fade>{form.error}</p>
          {/if}

          {#if form?.success}
            <p class="text-green-400" transition:fade>Vielen Dank für deine Nachricht! Wir melden uns in Kürze bei dir.</p>
          {/if}

          <p class="text-sm text-gray-300 max-w-xs text-center">
            Deine Daten werden gemäß unserer Datenschutzrichtlinien verwendet. Du kannst dich jederzeit abmelden.
          </p>
        </div>
      </form>

      <!-- Additional Contact Options -->
      <div class="mt-20 grid md:grid-cols-2 gap-8">
        <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur text-center md:text-left">
          <h3 class="text-xl font-medium text-white mb-4">Artist werden</h3>
          <p class="text-gray-300 mb-6">Werde Teil unserer DJ-Community und teile deine Leidenschaft für Musik!</p>
          <a 
            href="/artist-werden"
            class="inline-block px-8 py-3 text-center font-medium tracking-2xl border-2 border-green-400 hover:bg-green-400 hover:text-black text-green-400 focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300"
          >
            Jetzt anmelden
          </a>
        </div>

        <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur text-center md:text-left">
          <h3 class="text-xl font-medium text-white mb-4">Partner werden</h3>
          <p class="text-gray-300 mb-6">Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!</p>
          <a 
            href="/partner"
            class="inline-block px-8 py-3 text-center font-medium tracking-2xl border-2 border-green-400 hover:bg-green-400 hover:text-black text-green-400 focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300"
          >
            Jetzt anmelden
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
