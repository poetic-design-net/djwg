<script lang="ts">
  interface PricingPhase {
    phase: string;
    title: string;
    description: string;
    features: string[];
    status: 'completed' | 'current' | 'coming-soon';
  }

  export let title: string = "Sichere dir dein Ticket";
  export let description: string = "Wähle die passende Phase für dein Event-Ticket";

  const pricingPhases: PricingPhase[] = [
    {
      phase: "Phase 1",
      title: "2024 Workshop-Teilnehmer Exklusiv",
      description: "Ein exklusives Angebot nur für die Workshop-Teilnehmer von 2024. Als kleines Dankeschön an euch habt ihr die Möglichkeit, euch ein Ticket zu sichern, bevor es für andere verfügbar ist.",
      features: [
        "Frühester Zugang zu Tickets",
        "Exklusiver Vorzugspreis",
        "Garantierter Platz",
        "Vorverkaufsrecht für 2026"
      ],
      status: 'completed'
    },
    {
      phase: "Phase 2",
      title: "Vertrauensticket",
      description: "Das Vertrauensticket. In dieser Phase erhaltet ihr lediglich das Datum des Events, jedoch noch keinen Ort und keine Informationen zu den Artists. Dieses Ticket ist besonders günstig und zeigt euer Vertrauen in uns und unser Event.",
      features: [
        "Günstigster öffentlicher Preis",
        "Nur Datum bekannt",
        "Location noch geheim",
        "Artists noch geheim"
      ],
      status: 'current'
    },
    {
      phase: "Phase 3",
      title: "Early Bird Ticket",
      description: "Das Early Bird Ticket. Hier sind die Artists und der genaue Veranstaltungsort bereits bekannt. Nutzt die Gelegenheit, euch frühzeitig einen Platz zu sichern!",
      features: [
        "Vergünstigter Preis",
        "Alle Details bekannt",
        "Garantierter Platz",
        "Frühzeitige Planungssicherheit"
      ],
      status: 'coming-soon'
    },
    {
      phase: "Phase 4",
      title: "Reguläre Tickets",
      description: "Die regulären Ticketpreise. Diese Phase bietet die Standardpreise für alle, die sich nach den ersten drei Phasen anmelden.",
      features: [
        "Standardpreis",
        "Alle Details bekannt",
        "Verfügbarkeit nach Kapazität",
        "Flexible Buchung"
      ],
      status: 'coming-soon'
    }
  ];
</script>

<div class="container px-4 mx-auto">
  <div class="text-center mb-20">
    <span class="inline-block mb-4 text-sm text-purple-400 font-medium tracking-tighter">Ticket Phasen</span>
    <h2 class="font-heading mb-6 text-5xl md:text-6xl text-white tracking-tighter">{title}</h2>
    <p class="text-lg text-gray-300 md:max-w-md mx-auto">{description}</p>
  </div>

  <div class="flex flex-wrap -mx-4">
    {#each pricingPhases as phase}
      <div class="w-full md:w-1/2 lg:w-1/4 px-4 mb-8">
        <div class="relative h-full flex flex-col {phase.status === 'completed' ? 'bg-black/20 border-gray-900' : phase.status === 'current' ? 'bg-black/40 border-green-500' : 'bg-black/40 border-gray-800'} border rounded-5xl bg-gradient-radial-dark transition duration-200">
          <!-- Content Container -->
          <div class="flex-grow p-8">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-purple-400">{phase.phase}</span>
                {#if phase.status === 'completed'}
                  <span class="text-xs text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full">Abgeschlossen</span>
                {:else if phase.status === 'current'}
                  <span class="text-xs text-green-500 bg-green-500/20 px-3 py-1 rounded-full">Aktuell</span>
                {:else}
                  <span class="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">Coming Soon</span>
                {/if}
              </div>
              <h3 class="mb-4 text-xl {phase.status === 'completed' ? 'text-gray-500' : 'text-white'}">{phase.title}</h3>
              <p class="{phase.status === 'completed' ? 'text-gray-600' : phase.status === 'coming-soon' ? 'text-gray-400' : 'text-gray-300'} text-sm">{phase.description}</p>
            </div>
            <ul class="mb-6">
              {#each phase.features as feature}
                <li class="flex items-center mb-4">
                  <svg class="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke={phase.status === 'completed' ? "#4B5563" : phase.status === 'current' ? "#22C55E" : "#6B7280"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke={phase.status === 'completed' ? "#4B5563" : phase.status === 'current' ? "#22C55E" : "#6B7280"} stroke-width="1.5"/>
                  </svg>
                  <span class="{phase.status === 'completed' ? 'text-gray-600' : phase.status === 'coming-soon' ? 'text-gray-400' : 'text-gray-300'} text-sm">{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
          
          <!-- Button Container (Always at Bottom) -->
          <div class="p-8 pt-0 text-center">
            {#if phase.status === 'completed'}
              <span class="inline-block w-full py-4 px-6 text-sm font-medium bg-gray-900 text-gray-600 rounded-full cursor-not-allowed">
                Phase beendet
              </span>
            {:else if phase.status === 'current'}
              <a class="inline-block w-full py-4 px-6 text-sm  text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200" href="#tickets">
                Mehr erfahren
              </a>
            {:else}
              <span class="inline-block w-full py-4 px-6 text-sm font-medium bg-gray-800 text-gray-400 rounded-full cursor-not-allowed">
                Demnächst verfügbar
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
