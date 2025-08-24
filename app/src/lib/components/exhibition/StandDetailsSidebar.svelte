<script lang="ts">
  import { selectedStand } from '$lib/stores/exhibition'
  import { CATEGORY_LABELS, STATUS_COLORS } from '$lib/types/exhibition'
  import imageUrlBuilder from '@sanity/image-url'
  import { client } from '$lib/sanity/client'
  import { fly, fade } from 'svelte/transition'

  const builder = imageUrlBuilder(client)

  function closeSidebar() {
    selectedStand.set(null)
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Verfügbar',
      occupied: 'Belegt',
      reserved: 'Reserviert',
      blocked: 'Gesperrt',
    }
    return labels[status] || status
  }

  function getStandTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      small: 'Klein',
      standard: 'Standard',
      premium: 'Premium',
      medium: 'Mittel',
      large: 'Groß',
    }
    return labels[type] || type
  }

  function getFeatureLabel(feature: string): string {
    const labels: Record<string, string> = {
      power: 'Stromanschluss',
      water: 'Wasseranschluss',
      internet: 'Internet/WLAN',
      corner: 'Eckstand',
      mainAisle: 'Hauptgang',
    }
    return labels[feature] || feature
  }
</script>

{#if $selectedStand}
  <!-- Backdrop for mobile -->
  <div
    class="fixed inset-x-0 top-20 bottom-0 bg-black bg-opacity-25 z-40 lg:hidden"
    on:click={closeSidebar}
    transition:fade={{ duration: 200 }}
  />

  <!-- Sidebar -->
  <div
    class="fixed right-0 top-20 h-[calc(100vh-5rem)] w-full sm:w-96 bg-white shadow-xl z-50 overflow-y-auto"
    transition:fly={{ x: 400, duration: 300 }}
  >
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Stand-Details</h2>
        <button
          on:click={closeSidebar}
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Schließen"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Stand Number & Status -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">
            Stand {$selectedStand.standNumber}
          </h3>
          <div class="mt-2 flex items-center gap-2">
            <span 
              class="inline-block px-3 py-1 text-sm font-medium rounded-full"
              style="background-color: {STATUS_COLORS[$selectedStand.status]}20; color: {STATUS_COLORS[$selectedStand.status]}"
            >
              {getStatusLabel($selectedStand.status)}
            </span>
            {#if $selectedStand.standType}
              <span class="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                {getStandTypeLabel($selectedStand.standType)}
              </span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Exhibitor Information (if occupied) -->
      {#if $selectedStand.exhibitor}
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <!-- Logo -->
          {#if $selectedStand.exhibitor.logo}
            <div class="mb-4">
              <img
                src={builder.image($selectedStand.exhibitor.logo).width(200).url()}
                alt={$selectedStand.exhibitor.company}
                class="h-16 object-contain"
              />
            </div>
          {/if}

          <h4 class="text-lg font-semibold text-gray-900 mb-1">
            {$selectedStand.exhibitor.company}
            {#if $selectedStand.exhibitor.isPremium}
              <span class="ml-2 text-yellow-500">⭐</span>
            {/if}
          </h4>
          
          {#if $selectedStand.exhibitor.category}
            <p class="text-sm text-gray-600 mb-3">
              {CATEGORY_LABELS[$selectedStand.exhibitor.category] || $selectedStand.exhibitor.category}
            </p>
          {/if}

          {#if $selectedStand.exhibitor.description}
            <p class="text-sm text-gray-700 mb-4">
              {$selectedStand.exhibitor.description}
            </p>
          {/if}

          <!-- Contact Information -->
          {#if $selectedStand.exhibitor.contact}
            <div class="space-y-2">
              {#if $selectedStand.exhibitor.contact.email}
                <div class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-gray-700">{$selectedStand.exhibitor.contact.email}</span>
                </div>
              {/if}
              
              {#if $selectedStand.exhibitor.contact.phone}
                <div class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-sm text-gray-700">{$selectedStand.exhibitor.contact.phone}</span>
                </div>
              {/if}
              
              {#if $selectedStand.exhibitor.contact.website}
                <div class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a
                    href={$selectedStand.exhibitor.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Website besuchen
                  </a>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Stand Information -->
      <div class="border-t pt-6">
        <h5 class="text-sm font-medium text-gray-900 mb-3">Stand-Informationen</h5>
        <dl class="space-y-2">
          <div class="flex justify-between">
            <dt class="text-sm text-gray-600">Halle</dt>
            <dd class="text-sm font-medium text-gray-900">{$selectedStand.hall?.name || 'Unbekannt'}</dd>
          </div>
          
          <div class="flex justify-between">
            <dt class="text-sm text-gray-600">Größe</dt>
            <dd class="text-sm font-medium text-gray-900">
              {$selectedStand.size.width} × {$selectedStand.size.height} m
            </dd>
          </div>
          
          {#if $selectedStand.price}
            <div class="flex justify-between">
              <dt class="text-sm text-gray-600">Preis</dt>
              <dd class="text-sm font-medium text-gray-900">€{$selectedStand.price}</dd>
            </div>
          {/if}
        </dl>

        <!-- Features -->
        {#if $selectedStand.features && $selectedStand.features.length > 0}
          <div class="mt-4">
            <h6 class="text-xs font-medium text-gray-900 mb-2">Ausstattung</h6>
            <div class="flex flex-wrap gap-2">
              {#each $selectedStand.features as feature}
                <span class="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                  {getFeatureLabel(feature)}
                </span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Notes -->
        {#if $selectedStand.notes}
          <div class="mt-4">
            <h6 class="text-xs font-medium text-gray-900 mb-2">Hinweise</h6>
            <p class="text-sm text-gray-600">{$selectedStand.notes}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}