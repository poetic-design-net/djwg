<script lang="ts">
  import { fade } from 'svelte/transition';
  import { enhance } from '$app/forms';
  
  export let data;
  export let form: any;
  
  const { settings, partnerPage } = data;
  
  let isSubmitting = false;
</script>

<svelte:head>
  <title>{partnerPage?.seo?.title || 'Partner werden'} | {settings.title || 'DJ Workshop'}</title>
  <meta name="description" content={partnerPage?.seo?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!'} />
</svelte:head>

<section class="py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="md:max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Partner & Aussteller</span>
        <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">
          {partnerPage?.title || 'Partner werden'}
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          {partnerPage?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community! Fülle das Formular aus und wir melden uns bei dir.'}
        </p>
      </div>

      <!-- Partner Benefits Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        {#if partnerPage?.benefits}
          {#each partnerPage.benefits as benefit}
            <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
              <h3 class="text-xl font-medium text-white mb-3">{benefit.title}</h3>
              <p class="text-gray-300">{benefit.description}</p>
            </div>
          {/each}
        {:else}
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Direkte Zielgruppe</h3>
            <p class="text-gray-300">Erreiche motivierte DJs und Musikbegeisterte direkt vor Ort.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Präsentation</h3>
            <p class="text-gray-300">Eigener Stand und Präsentationsmöglichkeiten für deine Produkte.</p>
          </div>
          <div class="p-6 rounded-2xl bg-gray-800/50 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Networking</h3>
            <p class="text-gray-300">Knüpfe wertvolle Kontakte in der DJ- und Musikbranche.</p>
          </div>
        {/if}
      </div>

      <!-- Partner Application Form -->
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
                class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors"
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
              class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors min-h-[100px]"
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
              class="w-full px-6 py-4 text-gray-300 bg-transparent border border-gray-900 rounded-3xl focus:border-white focus:outline-none transition-colors min-h-[150px]"
              class:border-red-500={form?.error}
              placeholder="Deine Nachricht..."
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

      <!-- Additional Info Section -->
      <div class="mt-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">
            {partnerPage?.whyPartnerSection?.title || 'Warum Partner werden?'}
          </h2>
          <p class="text-gray-300">
            {partnerPage?.whyPartnerSection?.description || 'Als Partner des DJ Workshops profitierst du von unserem starken Netzwerk und direktem Zugang zur DJ-Community.'}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          {#if partnerPage?.exhibitorInfo}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{partnerPage.exhibitorInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each partnerPage.exhibitorInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">Ausstellerfläche</h3>
              <ul class="space-y-3 text-gray-300">
                <li>• Professionell ausgestattete Standfläche</li>
                <li>• Technische Ausstattung nach Bedarf</li>
                <li>• Optimale Präsentationsmöglichkeiten</li>
                <li>• Flexible Standgrößen verfügbar</li>
              </ul>
            </div>
          {/if}

          {#if partnerPage?.marketingInfo}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{partnerPage.marketingInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each partnerPage.marketingInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">Marketing & Promotion</h3>
              <ul class="space-y-3 text-gray-300">
                <li>• Präsenz auf unserer Website</li>
                <li>• Social Media Promotion</li>
                <li>• Erwähnung in Newsletter</li>
                <li>• Logo-Präsenz auf Event-Material</li>
              </ul>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
