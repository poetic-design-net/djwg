<script lang="ts">
  import { onMount } from 'svelte'
  import Fuse from 'fuse.js'
  import type { ExhibitionStand } from '$lib/types/exhibition'
  import { CATEGORY_LABELS, STATUS_COLORS } from '$lib/types/exhibition'
  import { filters, zoomToStand, selectedHall } from '$lib/stores/exhibition'
  import { debounce } from '$lib/utils/debounce'

  export let stands: ExhibitionStand[] = []

  let searchQuery = ''
  let searchResults: ExhibitionStand[] = []
  let fuse: Fuse<ExhibitionStand>
  let isSearching = false
  let showResults = false

  $: {
    if (stands.length > 0) {
      initializeFuse(stands)
    }
  }

  onMount(() => {
    initializeFuse(stands)
  })

  function initializeFuse(standsData: ExhibitionStand[]) {
    const options = {
      keys: [
        { name: 'standNumber', weight: 0.3 },
        { name: 'exhibitor.company', weight: 0.4 },
        { name: 'exhibitor.category', weight: 0.1 },
        { name: 'exhibitor.products', weight: 0.2 },
      ],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    }

    fuse = new Fuse(standsData, options)
  }

  const performSearch = debounce((query: string) => {
    if (!query || query.length < 2) {
      searchResults = []
      isSearching = false
      showResults = false
      return
    }

    isSearching = true
    const results = fuse.search(query)
    
    // Filter results based on selected hall if any
    searchResults = results
      .map(result => result.item)
      .filter(stand => !$selectedHall || stand.hall._id === $selectedHall._id)
      .slice(0, 10) // Limit to 10 results

    isSearching = false
    showResults = searchResults.length > 0
  }, 300)

  function handleSearchInput() {
    filters.update(f => ({ ...f, searchQuery }))
    performSearch(searchQuery)
  }

  function handleResultClick(stand: ExhibitionStand) {
    zoomToStand(stand, 2)
    showResults = false
    searchQuery = ''
    filters.update(f => ({ ...f, searchQuery: '' }))
  }

  function clearSearch() {
    searchQuery = ''
    searchResults = []
    showResults = false
    filters.update(f => ({ ...f, searchQuery: '' }))
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Verfügbar',
      booked: 'Gebucht',
      reserved: 'Reserviert',
      blocked: 'Gesperrt',
    }
    return labels[status] || status
  }
</script>

<div class="relative w-full">
  <!-- Search Input -->
  <div class="relative">
    <input
      type="text"
      bind:value={searchQuery}
      on:input={handleSearchInput}
      on:focus={() => searchQuery && performSearch(searchQuery)}
      placeholder="Suche nach Firma, Stand oder Kategorie..."
      class="w-full px-4 py-3 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label="Suche"
    />
    
    <!-- Search Icon -->
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Clear Button -->
    {#if searchQuery}
      <button
        on:click={clearSearch}
        class="absolute inset-y-0 right-0 flex items-center pr-3"
        aria-label="Suche löschen"
      >
        <svg class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}

    <!-- Loading Indicator -->
    {#if isSearching}
      <div class="absolute inset-y-0 right-10 flex items-center pr-3">
        <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    {/if}
  </div>

  <!-- Search Results Dropdown -->
  {#if showResults && searchResults.length > 0}
    <div class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <ul class="divide-y divide-gray-100">
        {#each searchResults as stand}
          <li>
            <button
              on:click={() => handleResultClick(stand)}
              class="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">
                      {stand.standNumber}
                    </span>
                    <span
                      class="inline-block w-3 h-3 rounded-full"
                      style="background-color: {STATUS_COLORS[stand.status]}"
                      title={getStatusLabel(stand.status)}
                    ></span>
                    {#if stand.exhibitor?.isPremium}
                      <span class="text-yellow-500" title="Premium">⭐</span>
                    {/if}
                  </div>
                  
                  {#if stand.exhibitor}
                    <div class="mt-1">
                      <p class="text-sm text-gray-700">{stand.exhibitor.company}</p>
                      <p class="text-xs text-gray-500 mt-1">
                        {CATEGORY_LABELS[stand.exhibitor.category] || stand.exhibitor.category}
                        • Halle {stand.hall.hallId}
                      </p>
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 mt-1">
                      {getStatusLabel(stand.status)} • Halle {stand.hall.hallId}
                    </p>
                  {/if}
                </div>

                <div class="ml-4 flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- No Results Message -->
  {#if showResults && searchResults.length === 0 && !isSearching && searchQuery}
    <div class="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <p class="text-sm text-gray-500 text-center">
        Keine Ergebnisse für "{searchQuery}" gefunden
      </p>
    </div>
  {/if}
</div>