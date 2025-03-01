<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SelectionCard from './SelectionCard.svelte';
  import type { Package, PackageSelectEvent } from './types';

  export let packages: Package[] = [];
  export let selectedPackage = '';

  const dispatch = createEventDispatcher<{
    select: PackageSelectEvent;
    back: void;
  }>();

  function handleSelect(packageId: string) {
    dispatch('select', { package: packageId });
  }

  function handleBack() {
    dispatch('back');
  }
</script>

<div class="space-y-8">
  <h2 class="text-2xl text-white font-medium text-center mb-8">
    Wähle dein Paket
  </h2>

  <div class="grid gap-6">
    {#each packages as pkg}
      <SelectionCard
        data={{
          title: pkg.title,
          description: `${pkg.price}\n${pkg.features.join('\n')}`
        }}
        selected={selectedPackage === pkg.id}
        on:select={() => handleSelect(pkg.id)}
      />
    {/each}
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
  </div>

  {#if !selectedPackage}
    <p class="text-sm text-gray-400 text-center">
      Bitte wähle ein Paket aus, um fortzufahren
    </p>
  {/if}
</div>