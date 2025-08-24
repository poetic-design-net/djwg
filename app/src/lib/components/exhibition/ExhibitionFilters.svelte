<script lang="ts">
  import { filters } from '$lib/stores/exhibition'
  import { CATEGORY_LABELS, STAND_TYPE_LABELS } from '$lib/types/exhibition'

  let showCategories = true
  let showStatus = true
  let showStandTypes = true

  const statusOptions = [
    { value: 'available', label: 'Verfügbar', color: '#10b981' },
    { value: 'booked', label: 'Gebucht', color: '#ef4444' },
    { value: 'reserved', label: 'Reserviert', color: '#f59e0b' },
    { value: 'blocked', label: 'Gesperrt', color: '#6b7280' },
  ]

  function toggleCategory(category: string) {
    filters.update(f => {
      const categories = f.categories || []
      const index = categories.indexOf(category)
      
      if (index > -1) {
        categories.splice(index, 1)
      } else {
        categories.push(category)
      }
      
      return { ...f, categories: [...categories] }
    })
  }

  function toggleStatus(status: string) {
    filters.update(f => {
      const statuses = f.status || []
      const index = statuses.indexOf(status)
      
      if (index > -1) {
        statuses.splice(index, 1)
      } else {
        statuses.push(status)
      }
      
      return { ...f, status: [...statuses] }
    })
  }

  function toggleStandType(type: string) {
    filters.update(f => {
      const types = f.standType || []
      const index = types.indexOf(type)
      
      if (index > -1) {
        types.splice(index, 1)
      } else {
        types.push(type)
      }
      
      return { ...f, standType: [...types] }
    })
  }

  function clearAllFilters() {
    filters.set({
      categories: [],
      status: [],
      standType: [],
      searchQuery: '',
      showSecret: $filters.showSecret,
    })
  }

  function hasActiveFilters(): boolean {
    return (
      ($filters.categories?.length || 0) > 0 ||
      ($filters.status?.length || 0) > 0 ||
      ($filters.standType?.length || 0) > 0
    )
  }
</script>

<div class="w-full space-y-4">
  <!-- Filter Header -->
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900">Filter</h3>
    {#if hasActiveFilters()}
      <button
        on:click={clearAllFilters}
        class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        Alle zurücksetzen
      </button>
    {/if}
  </div>

  <!-- Categories Filter -->
  <div class="border-b border-gray-200 pb-4">
    <button
      on:click={() => showCategories = !showCategories}
      class="flex items-center justify-between w-full text-left"
    >
      <span class="text-sm font-medium text-gray-900">Kategorien</span>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform {showCategories ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    {#if showCategories}
      <div class="mt-3 space-y-2">
        {#each Object.entries(CATEGORY_LABELS) as [value, label]}
          <label class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={$filters.categories?.includes(value)}
              on:change={() => toggleCategory(value)}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Status Filter -->
  <div class="border-b border-gray-200 pb-4">
    <button
      on:click={() => showStatus = !showStatus}
      class="flex items-center justify-between w-full text-left"
    >
      <span class="text-sm font-medium text-gray-900">Verfügbarkeit</span>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform {showStatus ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    {#if showStatus}
      <div class="mt-3 space-y-2">
        {#each statusOptions as option}
          <label class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={$filters.status?.includes(option.value)}
              on:change={() => toggleStatus(option.value)}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 flex items-center gap-2">
              <span
                class="inline-block w-3 h-3 rounded-full"
                style="background-color: {option.color}"
              ></span>
              <span class="text-sm text-gray-700">{option.label}</span>
            </span>
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Stand Type Filter -->
  <div class="border-b border-gray-200 pb-4">
    <button
      on:click={() => showStandTypes = !showStandTypes}
      class="flex items-center justify-between w-full text-left"
    >
      <span class="text-sm font-medium text-gray-900">Standgröße</span>
      <svg
        class="w-5 h-5 text-gray-400 transition-transform {showStandTypes ? 'rotate-180' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    {#if showStandTypes}
      <div class="mt-3 space-y-2">
        {#each Object.entries(STAND_TYPE_LABELS) as [value, label]}
          <label class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              checked={$filters.standType?.includes(value)}
              on:change={() => toggleStandType(value)}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Admin Options (if user is admin) -->
  <!-- TODO: Replace with actual admin check -->
  {#if true}
    <div class="pt-2">
      <label class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
        <input
          type="checkbox"
          bind:checked={$filters.showSecret}
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">
          Geheime Stände anzeigen
          <span class="text-gray-500">🔒</span>
        </span>
      </label>
    </div>
  {/if}

  <!-- Active Filters Summary -->
  {#if hasActiveFilters()}
    <div class="pt-2">
      <p class="text-xs text-gray-500 mb-2">Aktive Filter:</p>
      <div class="flex flex-wrap gap-2">
        {#each $filters.categories || [] as category}
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {CATEGORY_LABELS[category]}
            <button
              on:click={() => toggleCategory(category)}
              class="hover:text-blue-900"
              aria-label="Filter entfernen"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/each}
        
        {#each $filters.status || [] as status}
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            {statusOptions.find(s => s.value === status)?.label}
            <button
              on:click={() => toggleStatus(status)}
              class="hover:text-green-900"
              aria-label="Filter entfernen"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/each}
        
        {#each $filters.standType || [] as type}
          <span class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
            {STAND_TYPE_LABELS[type]}
            <button
              on:click={() => toggleStandType(type)}
              class="hover:text-purple-900"
              aria-label="Filter entfernen"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>