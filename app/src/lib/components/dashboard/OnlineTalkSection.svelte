<script lang="ts">
import Support from "./Support.svelte";


  export let onlineTalks: {
    _id: string;
    title: string;
    date: string;
    link: string;
    password: string;
    visibleFromHours: number;
  }[];

  // Prüfe ob die Details für einen Talk sichtbar sein sollen
  const isVisible = (talkDate: string, visibleFromHours: number) => {
    const now = new Date();
    const talkDateTime = new Date(talkDate);
    const visibleFromTime = new Date(talkDateTime.getTime() - (visibleFromHours * 60 * 60 * 1000));
    return now >= visibleFromTime;
  };

  // Prüfe ob der Talk abgelaufen ist
  const isExpired = (talkDate: string) => {
    const now = new Date();
    const talkDateTime = new Date(talkDate);
    // Ein Talk gilt als abgelaufen wenn er mehr als 24 Stunden zurückliegt
    const expiryTime = new Date(talkDateTime.getTime() + (24 * 60 * 60 * 1000));
    return now > expiryTime;
  };

  // Formatiere das Datum
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('In die Zwischenablage kopiert!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Filtere abgelaufene Talks heraus
  $: activeTalks = onlineTalks.filter(talk => !isExpired(talk.date));
</script>

<div class="relative rounded-3xl p-8 border border-gray-800/40 overflow-hidden h-full">
  <div class="absolute inset-0 mix-blend-overlay "></div>
  <div class="relative flex flex-col h-full">

    
    <!-- Online Talk Access -->
    <div class="mb-8">
      {#if activeTalks.length > 0}
        {#each activeTalks as talk (talk._id)}
          <div class="mb-8">
            <h3 class="text-xl font-medium text-gray-200  mb-4">{talk.title}</h3>
            <p class="text-green-400 mb-4">Termin: {formatDate(talk.date)}</p>
            <div class="space-y-4">
              {#if isVisible(talk.date, talk.visibleFromHours)}
                <div class="flex items-center space-x-3">
                  <a 
                    href={talk.link}
                    target="_blank"
                    class="flex-1 px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl text-center transition duration-300"
                  >
                    Zum Online Talk
                  </a>
                </div>
                <div class="flex items-center space-x-3">
                  <button 
                    class="flex-1 px-6 py-3 text-sm font-medium text-white bg-gray-950 hover:bg-gray-900 rounded-xl text-center transition duration-300"
                    on:click={() => copyToClipboard(talk.password)}
                  >
                    Passwort: {talk.password} (Klicken zum Kopieren)
                  </button>
                </div>
              {:else}
                <div class="flex items-start space-x-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-gray-100 font-medium">Zugangsdaten noch nicht verfügbar</p>
                    <p class="text-gray-50 mt-2 ">
                      Die Zugangsdaten werden automatisch {talk.visibleFromHours} Stunden vor Beginn des Talks freigeschaltet.
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      {:else}
        <div class="text-gray-400 text-center py-4">
          Aktuell sind keine Online Talks geplant.
        </div>
      {/if}
    </div>

    <!-- Support Options -->
    <div class="mt-8">
      <div class="space-y-4">
        <h3 class="text-xl font-medium text-white mb-4">Unterstütze DJ Workshop</h3>
        <p class="text-gray-400 mb-4">
          Hilf uns dabei, die DJ Community weiter zu fördern und neue Workshops anzubieten.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://buymeacoffee.com/djworkshopgermany"
            target="_blank"
            class="px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl text-center transition duration-300"
          >
            Buy me a Coffee ☕
          </a>
          <a 
            href="https://gofund.me/b30d051e"
            target="_blank"
            class="px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl text-center transition duration-300"
          >
            GoFundMe Kampagne 🎵
          </a>
        </div>
     </div>
    </div>

  </div>
</div>
