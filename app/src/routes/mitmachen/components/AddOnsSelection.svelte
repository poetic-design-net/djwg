<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AddOn, AddOnsSelectEvent } from './types';

  export let addOns: AddOn[] = [];
  export let selectedPackage = '';
  export let selectedAddOns: string[] = [];
  export let accommodation = {
    needed: false,
    persons: 1,
    roomType: 'double'
  };

  const dispatch = createEventDispatcher<{
    update: AddOnsSelectEvent;
    back: void;
  }>();

  function toggleAddOn(addOnId: string) {
    if (selectedAddOns.includes(addOnId)) {
      selectedAddOns = selectedAddOns.filter(id => id !== addOnId);
    } else {
      selectedAddOns = [...selectedAddOns, addOnId];
    }
  }

  function handleSubmit() {
    dispatch('update', {
      addOns: selectedAddOns,
      selectedPackage,
      selectedAddOns,
      accommodation
    });
  }

  function handleBack() {
    dispatch('back');
  }

  // Filtere Add-Ons basierend auf dem ausgewählten Paket
  $: availableAddOns = addOns.filter(addon => 
    addon.availableFor.includes(selectedPackage)
  );
</script>

<div class="space-y-8">
  <h2 class="text-2xl text-white font-medium text-center mb-8">
    Zusätzliche Optionen
  </h2>

  <!-- Add-Ons -->
  {#if availableAddOns.length > 0}
    <div class="space-y-6">
      <h3 class="text-xl text-white font-medium">Verfügbare Add-Ons</h3>
      
      {#each availableAddOns as addOn}
        <div 
          class="p-6 rounded-3xl border-2 transition-all cursor-pointer {selectedAddOns.includes(addOn.id) ? 'border-green-400 bg-green-400/10' : 'border-gray-800 hover:border-gray-600'}"
          on:click={() => toggleAddOn(addOn.id)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && toggleAddOn(addOn.id)}
        >
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-white font-medium">{addOn.title}</h4>
            <span class="text-green-400">{addOn.price}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Übernachtung -->
  <div class="space-y-6">
    <h3 class="text-xl text-white font-medium">Übernachtung</h3>
    
    <label class="flex items-center space-x-3 text-gray-300">
      <input
        type="checkbox"
        bind:checked={accommodation.needed}
        class="form-checkbox h-5 w-5 text-green-400 rounded border-gray-800 focus:ring-green-400"
      >
      <span>Ich benötige eine Übernachtungsmöglichkeit</span>
    </label>

    {#if accommodation.needed}
      <div class="space-y-4 pl-8">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">
            Anzahl Personen
          </label>
          <input
            type="number"
            min="1"
            max="4"
            bind:value={accommodation.persons}
            class="w-24 px-4 py-2 text-gray-300 bg-transparent border border-gray-800 rounded-xl focus:border-white focus:outline-none"
          >
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">
            Zimmertyp
          </label>
          <select
            bind:value={accommodation.roomType}
            class="w-full max-w-xs px-4 py-2 text-gray-300 bg-transparent border border-gray-800 rounded-xl focus:border-white focus:outline-none"
          >
            <option value="single">Einzelzimmer</option>
            <option value="double">Doppelzimmer</option>
          </select>
        </div>
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="flex justify-between space-x-4 mt-8">
    <button
      type="button"
      class="px-6 py-2 text-gray-300 hover:text-white transition-colors"
      on:click={handleBack}
    >
      Zurück
    </button>

    <button
      type="button"
      class="px-6 py-2 bg-green-400 text-black rounded-full hover:bg-green-300 transition-colors"
      on:click={handleSubmit}
    >
      Weiter
    </button>
  </div>
</div>