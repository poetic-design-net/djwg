<script lang="ts">
  import { fade } from 'svelte/transition';
  import { enhance } from '$app/forms';

  // Add collapsible state
  let isFormOpen = false;

  export let data;
  export let form: {
    error?: string;
    success?: boolean;
    message?: string;
  };

  const { settings, artistPage } = data;

  let formData = {
    name: '',
    email: '',
    phone: '',
    instagram: '',
    soundcloud: '',
    experience: 'beginner',
    message: ''
  };
</script>

<svelte:head>
  <title>{artistPage?.seo?.title || 'Artist werden'} | {settings.title || 'DJ Workshop'}</title>
  <meta name="description" content={artistPage?.seo?.description || 'Teile deine Leidenschaft für Musik und inspiriere die nächste Generation von DJs'} />
</svelte:head>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative pt-20 overflow-hidden">
    <div class="container px-4 mx-auto">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Artist werden</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">
          {artistPage?.title || 'Werde Teil unseres Teams'}
        </h1>
        <p class="text-2xl text-white/80 mb-8">
          {artistPage?.description || 'Teile deine Leidenschaft für Musik und inspiriere die nächste Generation von DJs'}
        </p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container px-4 mx-auto py-20">
    <div class="max-w-4xl mx-auto">
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">Deine Vorteile als Artist</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#if artistPage?.benefits}
            {#each artistPage.benefits as benefit}
              <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
                <h3 class="text-2xl text-white mb-4">{benefit.title}</h3>
                <p class="text-gray-300">{benefit.description}</p>
              </div>
            {/each}
          {:else}
            <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
              <h3 class="text-2xl text-white mb-4">Wertvolle Erfahrung</h3>
              <p class="text-gray-300">Entwickle dich als Trainer weiter und sammle wertvolle Erfahrungen in der Vermittlung deines Wissens.</p>
            </div>
            <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
              <h3 class="text-2xl text-white mb-4">Netzwerk</h3>
              <p class="text-gray-300">Werde Teil eines starken Netzwerks aus DJs, Produzenten und Veranstaltern. Profitiere von unserem Know-how.</p>
            </div>
            <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
              <h3 class="text-2xl text-white mb-4">Flexibilität</h3>
              <p class="text-gray-300">Gestalte deine Workshops nach deinen Vorstellungen und bring deine eigenen Ideen ein.</p>
            </div>
            <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
              <h3 class="text-2xl text-white mb-4">Spaß an der Sache!</h3>
              <p class="text-gray-300">Natürlich soll das ganze so viel Spaß bringen wie nur möglich!</p>
            </div>
          {/if}
        </div>
      </div>

      <div class="relative p-8 rounded-xl bg-gray-800/70 backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full">
        <div class="flex-grow">
          <h3 class="text-2xl font-medium text-white mb-2">Artist Live Präsentation</h3>
          <div class="flex items-baseline mb-6">
            <span class="text-4xl font-medium text-white">700€</span>
            <span class="text-sm text-gray-400 ml-2">+ 0.58€ Gebühr</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-start">
              <span class="text-green-400 mr-2">✔</span>
              <span class="text-gray-300">45 min Präsentation</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-400 mr-2">✔</span>
              <span class="text-gray-300">Social Media Advertising Basic</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-400 mr-2">✔</span>
              <span class="text-gray-300">Homepage Advertising</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-400 mr-2">✔</span>
              <span class="text-gray-300">Inkl. 2 Tickets</span>
            </li>
          </ul>
        </div>
        <a target="_blank" 
          href="https://eventix.shop/3vqdq8w3" 
          class="w-full px-6 py-3 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
        >
          Jetzt Paket buchen
        </a>
      </div>

      <!-- Contact Form -->
      <div class="my-20">
        <h2 class="text-4xl text-white mb-12 text-center">
          {artistPage?.formSettings?.title || 'oder bewirb dich jetzt'}
        </h2>
        
        {#if form?.success}
          <div class="max-w-2xl mx-auto p-6 bg-green-500/10 border border-green-500 rounded-3xl text-center mb-8" transition:fade>
            <p class="text-white">{artistPage?.formSettings?.successMessage || form.message}</p>
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
              <label for="name" class="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                bind:value={formData.name}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              >
            </div>
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
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label for="experience" class="block text-sm font-medium text-gray-300 mb-2">DJ Erfahrung</label>
              <select
                id="experience"
                name="experience"
                bind:value={formData.experience}
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              >
                {#if artistPage?.experienceLevels}
                  {#each artistPage.experienceLevels as level}
                    <option value={level.value}>{level.label}</option>
                  {/each}
                {:else}
                  <option value="beginner">1-2 Jahre</option>
                  <option value="intermediate">3-5 Jahre</option>
                  <option value="advanced">5+ Jahre</option>
                  <option value="professional">Professioneller DJ</option>
                {/if}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="instagram" class="block text-sm font-medium text-gray-300 mb-2">Instagram Profil</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  bind:value={formData.instagram}
                  placeholder="dein.username"
                  class="w-full pl-8 px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
              </div>
            </div>
            <div>
              <label for="soundcloud" class="block text-sm font-medium text-gray-300 mb-2">SoundCloud Profil</label>
              <input
                type="url"
                id="soundcloud"
                name="soundcloud"
                bind:value={formData.soundcloud}
                placeholder="https://soundcloud.com/..."
                class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
            </div>
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-300 mb-2">Deine Nachricht</label>
            <textarea
              id="message"
              name="message"
              bind:value={formData.message}
              rows="4"
              placeholder="Erzähle uns von dir und deiner DJ-Erfahrung..."
              class="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            ></textarea>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="inline-block px-8 py-4 text-lg text-black font-medium tracking-tighter bg-green-400 hover:bg-green-500 rounded-full transition duration-200"
            >
              Bewerbung senden
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
