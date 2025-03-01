<script lang="ts">
    import Wizard from './components/Wizard.svelte';
    import BenefitsSection from './components/BenefitsSection.svelte';
    import type { FormResult } from './types';
    
    export let data;
    // Typisiertes Form-Objekt
    export let form: FormResult | null = null;
    
    const { settings, participatePage } = data;
  </script>
  
  <svelte:head>
    <title>Mitmachen | {settings.title || 'DJ Workshop'}</title>
    <meta name="description" content="Werde Teil unseres DJ Workshops als Aussteller, Artist oder Hersteller!" />
  </svelte:head>
  
  <section class="py-20 overflow-hidden bg-black">
    <div class="container px-4 mx-auto">
      <div class="md:max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop</span>
          <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">
            Mitmachen
          </h1>
          <p class="text-lg text-gray-300 max-w-2xl mx-auto">
            Werde Teil unseres DJ Workshops und bringe deine Leidenschaft für Musik ein – als Artist, Aussteller oder Hersteller!
          </p>
        </div>
  
        <!-- Wizard -->
        <Wizard 
          settings={settings} 
          participatePage={participatePage} 
          {form}
        />
  
        <!-- Benefits Section -->
        <BenefitsSection 
          artistBenefits={participatePage?.artist?.benefits?.map(b => b.description) || []}
          ausstellerBenefits={participatePage?.partner?.benefits?.map(b => b.description) || []}
          herstellerBenefits={participatePage?.manufacturer?.benefits?.map(b => b.description) || []}
        />
      </div>
    </div>
  </section>