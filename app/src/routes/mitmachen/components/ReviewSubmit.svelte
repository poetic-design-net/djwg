<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WizardFormData, UserType, Package, AddOn } from './types';
  
  export let type: UserType;
  export let data: WizardFormData;
  export let isSubmitting = false;

  const dispatch = createEventDispatcher<{
    back: void;
    submit: void;
  }>();

  function handleSubmit() {
    dispatch('submit');
  }

  function handleBack() {
    dispatch('back');
  }

  function formatExperience(exp: string): string {
    const levels = {
      'beginner': '1-2 Jahre',
      'intermediate': '3-5 Jahre',
      'advanced': '5+ Jahre',
      'professional': 'Professioneller DJ'
    };
    return levels[exp as keyof typeof levels] || exp;
  }
</script>

<div class="space-y-8">
  <h2 class="text-2xl text-white font-medium text-center mb-8">
    Überprüfe deine Angaben
  </h2>

  <div class="space-y-6">
    <!-- Gemeinsame Informationen -->
    <div class="space-y-4">
      <h3 class="text-xl text-white font-medium">Kontaktdaten</h3>
      
      <div class="grid gap-4">
        <div>
          <span class="block text-sm text-gray-400">Name</span>
          <span class="text-white">{data.name}</span>
        </div>

        <div>
          <span class="block text-sm text-gray-400">E-Mail</span>
          <span class="text-white">{data.email}</span>
        </div>

        {#if data.phone}
          <div>
            <span class="block text-sm text-gray-400">Telefon</span>
            <span class="text-white">{data.phone}</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Artist-spezifische Informationen -->
    {#if type === 'artist'}
      <div class="space-y-4">
        <h3 class="text-xl text-white font-medium">DJ-Informationen</h3>
        
        <div class="grid gap-4">
          <div>
            <span class="block text-sm text-gray-400">Erfahrung</span>
            <span class="text-white">{formatExperience(data.experience)}</span>
          </div>

          {#if data.instagram}
            <div>
              <span class="block text-sm text-gray-400">Instagram</span>
              <a 
                href="https://instagram.com/{data.instagram.replace('@', '')}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-green-400 hover:underline"
              >
                {data.instagram}
              </a>
            </div>
          {/if}

          {#if data.soundcloud}
            <div>
              <span class="block text-sm text-gray-400">SoundCloud</span>
              <a 
                href="https://{data.soundcloud}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-green-400 hover:underline"
              >
                {data.soundcloud}
              </a>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Aussteller/Hersteller-spezifische Informationen -->
    {#if type === 'aussteller' || type === 'hersteller'}
      <div class="space-y-4">
        <h3 class="text-xl text-white font-medium">Firmeninformationen</h3>
        
        <div class="grid gap-4">
          {#if data.website}
            <div>
              <span class="block text-sm text-gray-400">Website</span>
              <a 
                href={data.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-green-400 hover:underline"
              >
                {data.website}
              </a>
            </div>
          {/if}

          <div>
            <span class="block text-sm text-gray-400">Firma</span>
            <span class="text-white">{data.company}</span>
          </div>

          {#if data.industry}
            <div>
              <span class="block text-sm text-gray-400">Branche</span>
              <span class="text-white">{data.industry}</span>
            </div>
          {/if}

          {#if data.products}
            <div>
              <span class="block text-sm text-gray-400">Produkte</span>
              <span class="text-white">{data.products}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Hersteller-spezifische Informationen -->
      {#if type === 'hersteller' && data.package}
        <div class="space-y-4">
          <h3 class="text-xl text-white font-medium">Paket & Add-Ons</h3>
          
          <div class="grid gap-4">
            <div>
              <span class="block text-sm text-gray-400">Ausgewähltes Paket</span>
              <span class="text-white">{data.package}</span>
            </div>

            {#if data.addOns && data.addOns.length > 0}
              <div>
                <span class="block text-sm text-gray-400">Add-Ons</span>
                <ul class="list-disc list-inside text-white">
                  {#each data.addOns as addOn}
                    <li>{addOn}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if data.accommodation?.needed}
              <div>
                <span class="block text-sm text-gray-400">Übernachtung</span>
                <span class="text-white">
                  {data.accommodation.persons} {data.accommodation.persons === 1 ? 'Person' : 'Personen'} im 
                  {data.accommodation.roomType === 'single' ? 'Einzelzimmer' : 'Doppelzimmer'}
                </span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/if}

    <!-- Nachricht -->
    <div class="space-y-4">
      <h3 class="text-xl text-white font-medium">Nachricht</h3>
      <p class="text-white whitespace-pre-wrap">{data.message}</p>
    </div>
  </div>

  <!-- Navigation -->
  <div class="flex justify-between space-x-4 mt-8">
    <button
      type="button"
      class="px-6 py-2 text-gray-300 hover:text-white transition-colors"
      on:click={handleBack}
      disabled={isSubmitting}
    >
      Zurück
    </button>

    <button
      type="submit"
      class="px-6 py-2 bg-green-400 text-black rounded-full hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Wird gesendet...' : 'Absenden'}
    </button>
  </div>
</div>