<script lang="ts">
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  import CheckIcon from '$lib/components/CheckIcon.svelte';
  import ContactForm from '$lib/components/aussteller/ContactForm.svelte';
  import Pricing from '$lib/components/Pricing.svelte';
  import type { Ticket } from '$lib/types/ticket';
  import Areas from '$lib/components/Areas.svelte';
  import type { Area } from '$lib/types/area'; // Platzhalter, muss evtl. angepasst werden // Ticket und Area Typen importieren



  // Info text für Pricing-Karten
  const priceInfo = "Wenn Sie uns im Voraus einen Artist nach Absprache zur Verfügung stellen, profitieren Sie von einem reduzierten Paketpreis. Kontaktieren Sie uns einfach vorher – wir freuen uns auf Ihre Anfrage!";
  
  export let data;
  export let form: any;
  
  // Annahme: areas werden jetzt über data.areas übergeben (muss im +page.server.ts angepasst werden)
  const { settings, ausstellerPage, tickets } = data;
  const areas = ausstellerPage?.areasSection?.areas || [];
  
  // Hilfsfunktion zur Prüfung, ob ein Ticket Addons hat
  function hasAddons(ticket: Ticket): boolean {
    return ticket.features.some(f => f.text.toLowerCase().includes('addon'));
  }
  const displayTickets = tickets?.length ? tickets : ausstellerPage?.ticketSection?.tickets || [];
  
  let isSubmitting = false;
  let showForm = false;
</script>

<svelte:head>
  <title>{ausstellerPage?.seo?.title || 'Aussteller werden'} | {settings.title || 'DJ Workshop'}</title>
  <meta name="description" content={ausstellerPage?.seo?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!'} />
</svelte:head>

<section class="py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="md:max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Partner & Aussteller</span>
        <h1 class="font-heading mb-8 text-5xl md:text-7xl lg:text-8xl text-white tracking-7xl lg:tracking-8xl">
          {ausstellerPage?.title || 'Aussteller werden'}
        </h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          {ausstellerPage?.description || 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!'}
        </p>
      </div>

      <!-- Partner Benefits Section -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        {#if ausstellerPage?.benefits}
          {#each ausstellerPage.benefits as benefit}
            <div class="p-6 rounded-2xl  border border-gray-700 hover:border-green-400 backdrop-blur text-center">
              <h3 class="text-xl font-medium text-white mb-3">{benefit.title}</h3>
              <p class="text-gray-300">{benefit.description}</p>
            </div>
          {/each}
        {:else}
          <div class="p-6 rounded-2xl border border-gray-700 hover:border-green-400  backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Direkte Zielgruppe</h3>
            <p class="text-gray-300">Erreiche motivierte DJs und Musikbegeisterte direkt vor Ort.</p>
          </div>
          <div class="p-6 rounded-2xl border border-gray-700 hover:border-green-400  backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Präsentation</h3>
            <p class="text-gray-300">Eigener Stand und Präsentationsmöglichkeiten für deine Produkte.</p>
          </div>
          <div class="p-6 rounded-2xl  border border-gray-700 hover:border-green-400 backdrop-blur text-center">
            <h3 class="text-xl font-medium text-white mb-3">Networking</h3>
            <p class="text-gray-300">Knüpfe wertvolle Kontakte in der DJ- und Musikbranche.</p>
          </div>
        {/if}
      </div>

      <!-- Additional Info Section -->
      <div class="my-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">
            {ausstellerPage?.whyPartnerSection?.title || 'Warum Aussteller werden?'}
          </h2>
          <p class="text-gray-300">
            {ausstellerPage?.whyPartnerSection?.description || 'Als Partner des DJ Workshops profitierst du von unserem starken Netzwerk und direktem Zugang zur DJ-Community.'}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          {#if ausstellerPage?.exhibitorInfo}
            <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400  backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{ausstellerPage.exhibitorInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each ausstellerPage.exhibitorInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">Ausstellerfläche</h3>
              <ul class="space-y-3 text-gray-300">
                <li>• Professionell ausgestattete Standfläche</li>
                <li>• Technische Ausstattung nach Bedarf</li>
                <li>• Optimale Präsentationsmöglichkeiten</li>
                <li>• Flexible Standgrößen verfügbar</li>
              </ul>
            </div>
            
          {/if}

          {#if ausstellerPage?.marketingInfo}
            <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
              <h3 class="text-xl font-medium text-white mb-4">{ausstellerPage.marketingInfo.title}</h3>
              <ul class="space-y-3 text-gray-300">
                {#each ausstellerPage.marketingInfo.items as item}
                  <li>• {item}</li>
                {/each}
              </ul>
            </div>
          {:else}
            <div class="p-8 rounded-2xl   backdrop-blur border-gray-700 hover:border-green-400 border">
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

      <!-- Areas Section -->
      <div class="pb-20 bg-black/40">
        {#if areas && areas.length > 0}
          <Areas {areas} showButton={false} />
        {/if}
        </div>
    
      <!-- Pricing Section -->
      {#if ausstellerPage?.ticketSection && displayTickets.length > 0}
        <div class="my-20">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-medium text-white mb-4">{ausstellerPage.ticketSection.title}</h2>
            <p class="text-gray-300 mb-8">{ausstellerPage.ticketSection.description}</p>
          </div>

          <!-- Pricing Cards -->
          <div class="grid md:grid-cols-2 gap-8">
            {#each displayTickets as ticket}
              <div class="relative p-8 rounded-xl backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full" style="isolation: isolate;">
                <div class="absolute top-4 right-4 z-50">
                  <InfoIcon text={priceInfo} position="top" />
                </div>
                <div class="flex-grow">
                  <h3 class="text-2xl font-medium text-white mb-2">{ticket.title}</h3>
                  <div class="flex items-baseline mb-6">
                    <span class="text-4xl font-medium text-white">{ticket.price} {ticket.currency}</span>
                    <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
                  </div>
                  <p class="text-sm text-gray-100 mb-4 italic">{ticket.description}</p>
                  <ul class="space-y-3 mb-8 flex flex-col">
                    {#each ticket.features as feature}
                      <li class="flex items-start justify-between group">
                        <div class="flex items-start flex-grow">
                          <div class="mr-2 flex-shrink-0">
                            <CheckIcon />
                          </div>
                          <span class="text-gray-300">{feature.text}</span>
                        </div>
                        {#if feature.info}
                          <InfoIcon 
                            variant="light" 
                            size="sm" 
                            text={feature.info} 
                            position="left" 
                            className="ml-1 flex-shrink-0" 
                          />
                        {/if}
                      </li>
                    {/each}
                  </ul>
                </div>
                <a 
                  target="_blank" 
                  href={ticket.url || "https://eventix.shop/vc4cqfbu"} 
                  class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
                >
                  {ticket.buttonText || 'Jetzt Paket buchen'}
                </a>
                {#if hasAddons(ticket)}
                  <div class="text-xs absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white">
                    <span>+ Addons</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          
          <!-- Add-Ons Section -->
          {#if ausstellerPage?.ticketSection?.addons && ausstellerPage.ticketSection.addons.length > 0}
            <div class="mt-16">
              <h3 class="text-2xl font-medium text-white mb-6 text-center">Add-Ons</h3>
              <p class="text-sm text-gray-400 mb-8 text-center">Für Exhibitor und Area Branding Pakete</p>
              <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                {#each ausstellerPage.ticketSection.addons as addon}
                <div class="p-6 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur text-center flex flex-col h-full justify-between">
                  <div>
                    <h4 class="text-md font-medium text-white mb-2 flex items-center justify-center">
                      {addon.title}
                      {#if addon.info}
                        <InfoIcon variant="light" size="sm" text={addon.info} position="top" className="ml-1" />
                      {/if}
                    </h4>
                    <p class="text-gray-300 text-xs mb-3">{addon.description}</p>
                  </div>
                  {#if addon.forPackages}
                    <div class="flex justify-center mt-auto">
                      <span class="text-xs text-tourquis-500">{addon.forPackages}</span>
                    </div>
                  {/if}
                </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>        
      {/if}


      <div class="text-center mx-auto my-16">
        <a 
          href="/contact" 
          class="px-8 py-3 text-center font-medium tracking-2xl border border-purple-500 hover:border-purple-400 text-white bg-blue-500/20 hover:bg-blue-400/20 rounded-full transition duration-300 inline-block"
        >
          zum einfachen Kontakt
        </a>
      </div>

      <div class="text-center text-sm text-gray-700 mx-auto my-2">
        <span>oder</span>
      </div>


      <!--  Application Form -->
      <div class="my-8">
        <h3 class="text-2xl font-medium text-white mb-6 text-center">Kontaktiere uns für individuelle Anfragen</h3>
        <ContactForm {form} />
      </div>
      
    </div>
  </div>
</section>