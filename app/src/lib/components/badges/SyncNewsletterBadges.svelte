<script lang="ts">
    import { toasts } from '$lib/stores/toast';
    import { invalidateAll } from '$app/navigation';
    import { slide } from 'svelte/transition';
  
    export let buttonClass = "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
    
    let syncing = false;
    let error: string | null = null;
    let lastSyncInfo: {
      success: boolean;
      message: string;
      updatedUsers: number;
      timestamp: string;
    } | null = null;
    let showDetails = false;
  
    // Format-Funktion für Timestamps
    function formatTimestamp(timestamp: string): string {
      const date = new Date(timestamp);
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    
    async function syncNewsletterBadges() {
      syncing = true;
      error = null;
      showDetails = false;
      
      try {
        const response = await fetch('/api/sync-newsletter-badges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Synchronisation fehlgeschlagen: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Speichere Informationen über die letzte Synchronisierung
        lastSyncInfo = {
          ...result,
          timestamp: new Date().toISOString()
        };
        
        // Zeige eine spezifischere Nachricht basierend auf dem Ergebnis
        if (result.updatedUsers === 0) {
          toasts.info('Kein Update nötig, alle Newsletter-Abonnenten haben bereits das Badge');
        } else {
          toasts.success(`${result.updatedUsers} Benutzer(n) wurden Badges zugewiesen`);
        }
        
        // Automatisch Details anzeigen
        showDetails = true;
        
        await invalidateAll();
      } catch (err) {
        error = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten';
        toasts.error(error);
      } finally {
        syncing = false;
      }
    }
  </script>
  
  <div>
    {#if error}
      <div class="rounded-md bg-red-50 p-4 mb-4" transition:slide={{ duration: 300 }}>
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}
  
    <div class="flex flex-col space-y-4">
      <div>
        <button
          on:click={syncNewsletterBadges}
          disabled={syncing}
          class={buttonClass}
        >
          {#if syncing}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {/if}
          Newsletter-Badges synchronisieren
        </button>
      </div>
      
      {#if lastSyncInfo && showDetails}
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm space-y-2" transition:slide={{ duration: 300 }}>
          <div class="flex justify-between items-center">
            <h3 class="font-medium text-gray-800 dark:text-white">Letzte Synchronisierung</h3>
            <button 
              on:click={() => showDetails = false}
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div class="text-gray-600 dark:text-gray-400">Status:</div>
            <div class={lastSyncInfo.success ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-400"}>
              {lastSyncInfo.success ? "Erfolgreich" : "Fehlgeschlagen"}
            </div>
            
            <div class="text-gray-600 dark:text-gray-600">Zeitpunkt:</div>
            <div>{formatTimestamp(lastSyncInfo.timestamp)}</div>
            
            <div class="text-gray-600 dark:text-gray-600">Aktualisierte Benutzer:</div>
            <div>
              {#if lastSyncInfo.updatedUsers === 0}
                <span class="text-yellow-600 dark:text-yellow-400">Keine (alle bereits synchronisiert)</span>
              {:else}
                <span class="text-green-600 dark:text-green-500">{lastSyncInfo.updatedUsers}</span>
              {/if}
            </div>
            
            <div class="text-gray-600 dark:text-gray-600">Nachricht:</div>
            <div>{lastSyncInfo.message}</div>
          </div>
        </div>
      {/if}
    </div>
  </div>