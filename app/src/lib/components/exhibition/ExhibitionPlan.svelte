<script lang="ts">
  import { onMount } from 'svelte'
  import type { ExhibitionHall, ExhibitionStand, Exhibitor } from '$lib/types/exhibition'
  import {
    halls,
    stands,
    exhibitors,
    selectedHall,
    filteredStands,
    filters,
  } from '$lib/stores/exhibition'
  import { browser } from '$app/environment'
  import StandList from './StandList.svelte'
  import StandDetailsSidebar from './StandDetailsSidebar.svelte'
  import { toPng } from 'html-to-image'

  export let exhibitionHalls: ExhibitionHall[] = []
  export let exhibitionStands: ExhibitionStand[] = []
  export let exhibitionExhibitors: Exhibitor[] = []
  export let isAdmin = false

  let showLeftSidebar = true
  let exportingImage = false
  let canvasContainer: HTMLDivElement
  let ExhibitionCanvas: any
  let canvasRef: any

  onMount(async () => {
    // Debug: Log received data
    console.log('ExhibitionPlan received data:', {
      halls: exhibitionHalls,
      stands: exhibitionStands,
      exhibitors: exhibitionExhibitors,
      isAdmin
    })
    
    // Initialize stores with data
    halls.set(exhibitionHalls)
    stands.set(exhibitionStands)
    exhibitors.set(exhibitionExhibitors)
    
    // Set initial hall if available
    if (exhibitionHalls.length > 0 && !$selectedHall) {
      selectedHall.set(exhibitionHalls[0])
      console.log('Initial hall set to:', exhibitionHalls[0])
    }

    // Reset filters for simpler view
    filters.set({
      categories: [],
      status: [],
      searchQuery: '',
      standType: [],
      showSecret: isAdmin
    })

    // Dynamically import ExhibitionCanvas component (browser-only)
    if (browser) {
      const module = await import('./ExhibitionCanvas.svelte')
      ExhibitionCanvas = module.default
    }
  })

  function selectHall(hallId: string) {
    const hall = exhibitionHalls.find(h => h._id === hallId)
    if (hall) {
      selectedHall.set(hall)
    }
  }

  async function exportAsPNG() {
    if (!canvasContainer) return
    
    exportingImage = true
    
    try {
      const dataUrl = await toPng(canvasContainer, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })
      
      const link = document.createElement('a')
      link.download = `messeplan-${$selectedHall?.hallId || 'export'}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      exportingImage = false
    }
  }

  function toggleLeftSidebar() {
    showLeftSidebar = !showLeftSidebar
  }

  function handleStandClick(stand: ExhibitionStand) {
    if (canvasRef?.centerOnStand) {
      canvasRef.centerOnStand(stand)
    }
  }
  
  function resetView() {
    if (canvasRef?.centerView) {
      canvasRef.centerView()
    }
  }
  
  // Filter stands for current hall
  $: hallStands = exhibitionStands.filter(
    stand => $selectedHall && stand.hall?._id === $selectedHall._id
  )
</script>

<div class="flex h-full overflow-hidden bg-gray-50">
  <!-- Left Sidebar -->
  <div
    class="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden transition-all duration-300 {showLeftSidebar ? '' : '-ml-80'}"
  >
    <!-- Sidebar Header -->
    <div class="px-4 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Messeplan</h2>
        <button
          on:click={toggleLeftSidebar}
          class="p-1 rounded hover:bg-gray-100 lg:hidden"
          aria-label="Sidebar schließen"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Hall Selector -->
      <div class="mb-4">
        <label for="hall-select" class="block text-sm font-medium text-gray-700 mb-2">
          Halle auswählen
        </label>
        {#if exhibitionHalls.length > 0}
          <select
            id="hall-select"
            value={$selectedHall?._id || ''}
            on:change={(e) => selectHall(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Halle auswählen...</option>
            {#each exhibitionHalls as hall}
              {#if isAdmin || !hall.isSecret}
                <option value={hall._id}>
                  {hall.name} ({hall.hallId})
                  {#if hall.isSecret}🔒{/if}
                </option>
              {/if}
            {/each}
          </select>
        {:else}
          <div class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            Keine Hallen verfügbar
          </div>
        {/if}
      </div>

    </div>

    <!-- Stand List -->
    <div class="flex-1 overflow-hidden">
      <StandList 
        stands={hallStands}
        onStandClick={handleStandClick}
      />
    </div>

    <!-- Stats Footer -->
    <div class="px-4 py-4 border-t border-gray-200 bg-gray-50">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-500">Gesamt</p>
          <p class="font-semibold text-gray-900">{exhibitionStands.length} Stände</p>
        </div>
        <div>
          <p class="text-gray-500">Angezeigt</p>
          <p class="font-semibold text-gray-900">{hallStands.length} Stände</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Sidebar Toggle -->
  {#if !showLeftSidebar}
    <button
      on:click={toggleLeftSidebar}
      class="fixed left-4 top-24 z-30 p-2 bg-white rounded-lg shadow-lg lg:hidden"
      aria-label="Menü öffnen"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  {/if}

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Top Bar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          {#if $selectedHall}
            <div>
              <h1 class="text-xl font-semibold text-gray-900">
                {$selectedHall.name}
              </h1>
              <p class="text-sm text-gray-500">
                Halle {$selectedHall.hallId} • {hallStands.length} Stände
              </p>
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <!-- Reset View Button -->
          <button
            on:click={resetView}
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Ansicht zurücksetzen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span class="text-sm font-medium">Ansicht zurücksetzen</span>
          </button>
          
          <!-- Export Button -->
          <button
            on:click={exportAsPNG}
            disabled={exportingImage}
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {#if exportingImage}
              <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span class="text-sm font-medium">Exportiere...</span>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium">Als Bild exportieren</span>
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Canvas Container -->
    <div bind:this={canvasContainer} class="flex-1 relative overflow-hidden">
      {#if browser && ExhibitionCanvas}
        <svelte:component
          this={ExhibitionCanvas}
          bind:this={canvasRef}
          stands={exhibitionStands}
          hall={$selectedHall}
        />
      {:else}
        <div class="flex items-center justify-center h-full">
          <div class="text-gray-500">Lade Messeplan...</div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Stand Details Sidebar -->
  <StandDetailsSidebar />
</div>

<style>
  @media (max-width: 1024px) {
    .w-80 {
      position: fixed;
      left: 0;
      top: 5rem;
      height: calc(100vh - 5rem);
      z-index: 40;
    }
  }
</style>