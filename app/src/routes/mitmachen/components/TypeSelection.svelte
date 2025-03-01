<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SelectionCard from './SelectionCard.svelte';
  import type { TypeSelectEvent, SectionData } from './types';
  
  export let types: {
    artist: SectionData;
    aussteller: SectionData;
    hersteller: SectionData;
  };
  export let selectedType: string = '';

  const dispatch = createEventDispatcher<{
    select: TypeSelectEvent;
  }>();
  
  function handleSelect(type: 'artist' | 'aussteller' | 'hersteller') {
    dispatch('select', { type });
  }
</script>

<div class="space-y-8">
  <h2 class="text-2xl text-white font-medium text-center">
    Wie möchtest du mitmachen?
  </h2>
  
  <div class="space-y-4">
    <!-- Artist Option -->
    <SelectionCard
      data={{
        title: 'Artist werden',
        description: 'Teile deine Leidenschaft für Musik und inspiriere die nächste Generation von DJs',
        benefits: types.artist.benefits
      }}
      selected={selectedType === 'artist'}
      on:select={() => handleSelect('artist')}
    />
    
    <!-- Aussteller Option -->
    <SelectionCard
      data={{
        title: 'Aussteller werden',
        description: 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community direkt',
        benefits: types.aussteller.benefits
      }}
      selected={selectedType === 'aussteller'}
      on:select={() => handleSelect('aussteller')}
    />
    
    <!-- Hersteller Option -->
    <SelectionCard
      data={{
        title: 'Hersteller werden',
        description: 'Als Hersteller präsentierst du deine Produkte in verschiedenen Sponsoring-Optionen',
        benefits: types.hersteller.benefits
      }}
      selected={selectedType === 'hersteller'}
      on:select={() => handleSelect('hersteller')}
    />
  </div>
</div>