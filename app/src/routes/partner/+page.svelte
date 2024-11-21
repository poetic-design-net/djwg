<script lang="ts">
  import { fade } from 'svelte/transition';
  import Logos from '$lib/components/Logos.svelte';
  import type { Logo } from '$lib/sanity/queries';
  import { enhance } from '$app/forms';

  export let data: {
    logos: {
      data: Logo[];
    };
  };

  export let form: {
    error?: string;
    success?: boolean;
    message?: string;
  };

  let formData = {
    company: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'exhibitor' // or 'partner'
  };
</script>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative py-20 overflow-hidden">
    <div class="container px-4 mx-auto">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Partner werden</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">Gemeinsam Erfolg haben</h1>
        <p class="text-2xl text-white/80 mb-8">Werden Sie Teil der DJ Workshop Germany Community und präsentieren Sie Ihre Marke einem engagierten Publikum</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container px-4 mx-auto py-20">
    <div class="max-w-4xl mx-auto">
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">Ihre Vorteile als Partner</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Direkte Zielgruppe</h3>
            <p class="text-gray-300">Erreichen Sie DJ-Enthusiasten und Musikproduzenten direkt in ihrem Element. Präsentieren Sie Ihre Produkte genau dort, wo sie zum Einsatz kommen.</p>
          </div>
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Live-Präsentation</h3>
            <p class="text-gray-300">Demonstrieren Sie Ihre Produkte live vor Ort. Lassen Sie die Teilnehmer Ihre Geräte und Software direkt erleben und testen.</p>
          </div>
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Networking</h3>
            <p class="text-gray-300">Knüpfen Sie wertvolle Kontakte in der Branche. Treffen Sie andere Hersteller, DJs und Veranstalter.</p>
          </div>
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Markenbildung</h3>
            <p class="text-gray-300">Stärken Sie Ihre Markenwahrnehmung in der DJ- und Musikszene. Profitieren Sie von unserem starken Netzwerk.</p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-12 text-center">Werden Sie Partner</h2>
        
        {#if form?.success}
          <div class="max-w-2xl mx-auto p-6 bg-green-500/10 border border-green-500 rounded-3xl text-center mb-8" transition:fade>
            <p class="text-white">{form.message}</p>
          </div>
        {/if}

        {#if form?.error}
          <div class="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500 rounded-3xl text-center mb-8" transition:fade>
            <p class="text-white">{form.error}</p>
          </div>
        {/if}

        <form 
          method="POST"
          class="max-w-2xl mx-auto space-y-6"
          use:enhance
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="company" class="block text-sm font-medium text-gray-300 mb-2">Unternehmen</label>
              <input
                type="text"
                id="company"
                name="company"
                bind:value={formData.company}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              >
            </div>
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300 mb-2">Ansprechpartner</label>
              <input
                type="text"
                id="name"
                name="name"
                bind:value={formData.name}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">E-Mail</label>
              <input
                type="email"
                id="email"
                name="email"
                bind:value={formData.email}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              >
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                bind:value={formData.phone}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
            </div>
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-300 mb-2">Art der Partnerschaft</label>
            <select
              id="type"
              name="type"
              bind:value={formData.type}
              class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            >
              <option value="exhibitor">Aussteller</option>
              <option value="partner">Partner</option>
            </select>
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-300 mb-2">Ihre Nachricht</label>
            <textarea
              id="message"
              name="message"
              bind:value={formData.message}
              rows="4"
              class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            ></textarea>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="inline-block px-8 py-4 text-lg text-black font-medium tracking-tighter bg-green-400 hover:bg-green-500 rounded-full transition duration-200"
            >
              Anfrage senden
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
      <!-- Partners Section -->
      <div>
        <h2 class="text-4xl text-white mb-12 text-center">Diese Partner sind schon dabei</h2>
        <Logos logos={data.logos} />
      </div>
    </div>
  

