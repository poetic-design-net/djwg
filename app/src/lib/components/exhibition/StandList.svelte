<script lang="ts">
  import type { ExhibitionStand } from '$lib/types/exhibition'
  import { selectedStand } from '$lib/stores/exhibition'
  
  export let stands: ExhibitionStand[] = []
  export let onStandClick: (stand: ExhibitionStand) => void = () => {}
  
  function handleStandClick(stand: ExhibitionStand) {
    selectedStand.set(stand)
    onStandClick(stand)
  }
  
  // Group stands by exhibitor name
  $: sortedStands = stands.slice().sort((a, b) => {
    const nameA = a.exhibitor?.company || a.standNumber
    const nameB = b.exhibitor?.company || b.standNumber
    return nameA.localeCompare(nameB)
  })
</script>

<div class="h-full overflow-y-auto">
  <div class="p-4">
    <h3 class="text-lg font-semibold mb-4 text-gray-900">
      Aussteller ({stands.length})
    </h3>
    
    <div class="space-y-2">
      {#each sortedStands as stand}
        <button
          on:click={() => handleStandClick(stand)}
          class="w-full text-left p-3 rounded-lg transition-all hover:bg-blue-50 border-2 {$selectedStand?._id === stand._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {stand.exhibitor?.company || 'Unbekannt'}
                {#if stand.exhibitor?.isPremium}
                  <span class="ml-1 text-yellow-500">⭐</span>
                {/if}
              </div>
              <div class="text-sm text-gray-500">
                Stand {stand.standNumber}
                {#if stand.exhibitor?.category}
                  • {stand.exhibitor.category}
                {/if}
              </div>
            </div>
            <div class="ml-2">
              <div class="w-3 h-3 rounded-full {stand.status === 'occupied' ? 'bg-green-500' : stand.status === 'reserved' ? 'bg-yellow-500' : 'bg-gray-300'}"></div>
            </div>
          </div>
        </button>
      {/each}
    </div>
    
    {#if stands.length === 0}
      <div class="text-center py-8 text-gray-500">
        Keine Stände in dieser Halle
      </div>
    {/if}
  </div>
</div>

<style>
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
</style>