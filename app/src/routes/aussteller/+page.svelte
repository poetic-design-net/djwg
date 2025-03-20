<script lang="ts">
  import InfoIcon from '$lib/components/InfoIcon.svelte';
  import CheckIcon from '$lib/components/CheckIcon.svelte';
  import ContactForm from '$lib/components/aussteller/ContactForm.svelte';


  // Info text for pricing cards - besser formuliert
  const priceInfo = "Wenn Sie uns im Voraus einen Artist nach Absprache zur Verfügung stellen, profitieren Sie von einem reduzierten Paketpreis. Kontaktieren Sie uns einfach vorher – wir freuen uns auf Ihre Anfrage!";

  export let data;
  export let form: any;
  
  const { settings, ausstellerPage } = data;
  
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
            <div class="p-6 rounded-2xl  border border-green-400 backdrop-blur text-center">
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
      </div>

      <!-- Areas Section -->
      <div class="my-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">Unsere Areas</h2>
          <p class="text-gray-300">Entdecke die verschiedenen Bereiche des DJ Workshops</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Messe Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Messe Area</h3>
            <p class="text-gray-300">Zentrale Ausstellungsfläche für Partner und Händler. Hier präsentieren sich die führenden Marken der DJ- und Musikindustrie.</p>
          </div>

          <!-- Mixing & Scratching Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Mixing & Scratching Area</h3>
            <p class="text-gray-300">Interaktiver Bereich für Live-Performances und Workshops. Hier können DJs ihr Können zeigen und neue Techniken erlernen.</p>
          </div>

          <!-- Marketing & Social Media Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Marketing & Social Media Area</h3>
            <p class="text-gray-300">Networking-Zone für Marketing und Social Media Strategien. Experten teilen ihr Wissen über digitale Präsenz und Branding.</p>
          </div>

          <!-- Producing Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Producing Area</h3>
            <p class="text-gray-300">Kreativzone für Musikproduktion und Sound-Design. Hier entstehen neue Beats und Tracks mit modernster Technik.</p>
          </div>

          <!-- Panel & Show Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Panel & Show Area</h3>
            <p class="text-gray-300">Bühne für Diskussionen, Präsentationen und Live-Shows. Hier treffen sich Experten und teilen ihre Erfahrungen.</p>
          </div>

          <!-- Flohmarkt Area -->
          <div class="p-8 rounded-2xl border border-gray-700 hover:border-green-400 backdrop-blur">
            <h3 class="text-xl font-medium text-white mb-4">Flohmarkt Area</h3>
            <p class="text-gray-300">Marktplatz für gebrauchtes Equipment und Vinyl. Die perfekte Gelegenheit zum Stöbern und Entdecken von Schätzen.</p>
          </div>
      </div>
    

      <!-- Pricing Section -->
      <div class="my-20">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-medium text-white mb-4">Unsere Ausstellerpakete</h2>
          <p class="text-gray-300 mb-8">Wähle das passende Paket für deine Präsentation auf dei DJ Workshop Germany</p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Sponsor/Supporter Card -->
          <div class="relative p-8 rounded-xl backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full" style="isolation: isolate;">
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Sponsor / Supporter</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">380,- €</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <ul class="space-y-3 mb-8 flex flex-col">
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                  <div class="mr-2 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span class="text-gray-300">Social Media Basic</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Regelmäßige Erwähnung in unseren Stories und Feed-Posts" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                  <div class="mr-2 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span class="text-gray-300">Homepage Basic</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Logo-Platzierung auf der Website und Verlinkung zu Ihrer Webpräsenz" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                  <div class="mr-2 flex-shrink-0"><CheckIcon /></div>
                  <span class="text-gray-300">Merchandise Basic</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Logo auf Event-Materialien" position="left" className="ml-1 flex-shrink-0" />
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
          </div>

          <!-- Exhibitor Card -->
          <div class="relative p-8 rounded-xl   backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-green-400 before:to-blue-500 before:rounded-t-3xl">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-500 text-black text-sm font-medium px-4 py-1 rounded-full">Populär</div>
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Exhibitor</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">700,- €</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <p class="text-sm text-gray-100 mb-4 italic">Inkl. aller Features des Supporter Pakets (380€)</p>
              <ul class="space-y-3 mb-8 flex flex-col">
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">5 qm Ausstellerfläche</span>
                  </div>
                  <InfoIcon variant="light" size="sm" text="Ausstellerfläche für 2 Tage" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">3 Exhibitor Tickets</span>
                  </div>
                  <InfoIcon variant="light" size="sm" text="Voller Event-Zugang für 3 Mitarbeiter " position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start">
                  <div class="mr-2 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div class="flex items-start justify-between w-full">
                    <span class="text-gray-300">2 Free Tickets</span>
                    <InfoIcon variant="light" size="sm" text="Zwei Premium Event-Tickets zum Verschenken" position="left" className="ml-1 flex-shrink-0" />
                  </div>
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
            <div class="text-xs absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white">
              <span>+ Addons</span>
            </div>
          </div>

          <!-- Area Branding Card -->
          <div class="relative p-8 rounded-xl  backdrop-blur border border-gray-700 hover:border-green-400 transition-all duration-300 flex flex-col h-full">
            <div class="absolute top-4 right-4 z-50">
                <InfoIcon text={priceInfo} position="top" />
            </div>
            <div class="flex-grow">
              <h3 class="text-2xl font-medium text-white mb-2">Area Branding</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-4xl font-medium text-white">5.000,- €</span>
                <span class="text-sm text-gray-400 ml-2">inkl. MwSt</span>
              </div>
              <p class="text-sm text-gray-100 italic mb-4">Inkl. aller Features des Exhibitor Pakets (700€)</p>
              <ul class="space-y-3 mb-8 flex flex-col">
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">Area Branding - Exklusive Bereiche</span>
                  </div>
                  <InfoIcon variant="light" size="sm" text="Exklusive Namensgebung für Event-Bereiche: 'Light Area by [Ihre Marke]', 'Sound Area by [Ihre Marke]'" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">7 qm Premium Standfläche</span>
                  </div>
                  <InfoIcon variant="light" size="sm" text="Großzügige Ausstellerfläche an Premium-Position" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">5 Exhibitor Tickets</span>
                  </div>
                  <InfoIcon variant="light" size="sm" text="Fünf Vollzugang-Tickets für Ihr Team " position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">Premium Social Media</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Eigene Story-Highlights, Reel-Produktion, Premium Posts mit Markierung" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">Premium Video Content</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Professionelles Video-Feature, After-Movie Integration, eigene Produkt-Highlights" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start justify-between group">
                  <div class="flex items-start flex-grow">
                    <div class="mr-2 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span class="text-gray-300">Featured Partner Status</span>
                  </div>
                  <InfoIcon variant="light"size="sm" text="Premium Website-Platzierung, Hervorgehobene Position in allen Marketingmaterialien" position="left" className="ml-1 flex-shrink-0" />
                </li>
                <li class="flex items-start">
                  <div class="mr-2 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <div class="flex items-start justify-between w-full">
                    <span class="text-gray-300">Video Content Advertising</span>
                    <InfoIcon
                      variant="light" size="sm" text="Professionelles Video-Feature und After-Movie Integration"
                      position="left" className="ml-1 flex-shrink-0" />
                  </div>
                </li>
              </ul>
            </div>
            <a target="_blank" 
              href="https://eventix.shop/vc4cqfbu" 
              class="w-full px-6 py-3 text-center font-medium tracking-2xl border border-green-400 bg-green-400 hover:bg-green-500 text-black rounded-full transition duration-300"
            >
              Jetzt Paket buchen
            </a>
            <div class="text-xs absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white">
              <span>+ Addons</span>
            </div>
          </div>
        </div>

        <!-- Add-Ons Section -->
        <div class="mt-16">
          <h3 class="text-2xl font-medium text-white mb-6 text-center">Add-Ons</h3>
          <p class="text-sm text-gray-400 mb-8 text-center">Für Exhibitor und Area Branding Pakete</p>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Card 1 -->
            <div class="p-6 rounded-2xl border border-gray-700 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2 flex items-center justify-center">
                  Extra Stand Space
                  <InfoIcon variant="light"size="sm" text="Erweitern Sie Ihre Präsentationsfläche, Flexible Gestaltungsmöglichkeiten, Stromversorgung und Grundausstattung inklusive, Ideal für große Produktpräsentationen" position="top" className="ml-1" />
                </h4>
                <p class="text-gray-300 mb-3">1 qm - 140€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 2 -->
            <div class="p-6 rounded-2xl border border-gray-700 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2 flex items-center justify-center">
                  Social Media Promotion Push
                  <InfoIcon variant="light"size="sm" text="Zusätzliche Social Media Kampagne, Dedizierte Story-Highlights, Produkt-Feature Posts, Gesteigerte Online-Präsenz" position="top" className="ml-1" />
                </h4>
                <p class="text-gray-300 mb-3">240€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 3 -->
            <div class="p-6 rounded-2xl border border-gray-700 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2 flex items-center justify-center">
                  Extra Exhibitor Ticket
                  <InfoIcon variant="light"size="sm" text="Zusätzlicher Mitarbeiter-Zugang, Voller Event-Zugang, Zugang zu allen Bereichen und Workshops" position="top" className="ml-1" />
                </h4>
                <p class="text-gray-300 mb-3">50€ inkl. MwSt pro Ticket (max. 3)</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
            
            <!-- Card 4 -->
            <div class="p-6 rounded-2xl border border-gray-700 backdrop-blur text-center flex flex-col h-full justify-between">
              <div>
                <h4 class="text-lg font-medium text-white mb-2 flex items-center justify-center">
                  Extra Video Content Advertising
                  <InfoIcon variant="light"size="sm" text="Zusätzliche Video-Produktion, Eigene Produkt-Präsentationen, Integration in Event-Highlights, Social Media Distribution" position="top" className="ml-1" />
                </h4>
                <p class="text-gray-300 mb-3">380€ inkl. MwSt</p>
              </div>
              <div class="flex justify-center mt-auto">
                <span class="text-xs px-3 py-1 bg-gray-700 rounded-full text-gray-300">Für Exhibitor & Area Branding</span>
              </div>
            </div>
          </div>
        </div>


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
     
          <h3 class="text-2xl font-medium text-white mb-6 text-center">Kontaktiere uns für individuelle Anfragen</h3>
          <ContactForm {form} />
      
      
  </div>
</section>