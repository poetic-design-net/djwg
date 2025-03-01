<script lang="ts">
  import type { Benefit } from './types';

  // Props - erlaubt sowohl Strings als auch Benefit-Objekte
  export let artistBenefits: (string | Benefit)[] = [
    'Wertvolle Erfahrung als Trainer',
    'Teil eines starken DJ-Netzwerks',
    'Flexibilität bei Workshop-Gestaltung',
    'Faire Vergütung für dein Engagement'
  ];
  
  export let ausstellerBenefits: (string | Benefit)[] = [
    'Direkte Zielgruppe vor Ort erreichen',
    'Eigener Stand zur Produktpräsentation',
    'Networking in der DJ-Branche',
    'Marketing und Promotion über Event-Kanäle'
  ];
  
  export let herstellerBenefits: (string | Benefit)[] = [
    'Verschiedene Sponsoring-Optionen',
    'Prominente Markenplatzierung',
    'Social Media und Homepage Werbung',
    'Direkter Kontakt zur DJ-Community'
  ];

  // Hilfsfunktion zum Extrahieren des Benefit-Textes
  function getBenefitText(benefit: string | Benefit): string {
    return typeof benefit === 'string' ? benefit : benefit.description;
  }
</script>

<div class="mt-20">
  <div class="text-center mb-12">
    <h2 class="text-3xl font-medium text-white mb-4">Vorteile der Teilnahme</h2>
    <p class="text-gray-300">
      Profitiere von unserem starken Netzwerk und erreiche die DJ-Community direkt vor Ort.
    </p>
  </div>

  <div class="grid md:grid-cols-3 gap-8">
    <!-- Benefits for Artists -->
    <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
      <h3 class="text-xl font-medium text-white mb-4">Als Artist</h3>
      <ul class="space-y-3 text-gray-300">
        {#each artistBenefits as benefit}
          <li>• {getBenefitText(benefit)}</li>
        {/each}
      </ul>
    </div>
    
    <!-- Benefits for Aussteller -->
    <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
      <h3 class="text-xl font-medium text-white mb-4">Als Aussteller</h3>
      <ul class="space-y-3 text-gray-300">
        {#each ausstellerBenefits as benefit}
          <li>• {getBenefitText(benefit)}</li>
        {/each}
      </ul>
    </div>
    
    <!-- Benefits for Hersteller -->
    <div class="p-8 rounded-2xl bg-gray-800/50 backdrop-blur">
      <h3 class="text-xl font-medium text-white mb-4">Als Hersteller</h3>
      <ul class="space-y-3 text-gray-300">
        {#each herstellerBenefits as benefit}
          <li>• {getBenefitText(benefit)}</li>
        {/each}
      </ul>
    </div>
  </div>
</div>