<script lang="ts">
  import type { Profile } from '$lib/types/profile';
  import { calculateProfileCompletion, getProfileFields, calculateCategoryCompletion, getNextRequiredField } from '$lib/utils/profile-utils';

  export let profile: Partial<Profile>;
  export let firstName: string;
  export let lastName: string;
  export let instagram: string;
  export let facebook: string;
  export let soundcloud: string;

  // Profil-Felder und Fortschritt
  $: profileFields = getProfileFields(profile, firstName, lastName, { instagram, facebook, soundcloud });
  $: completionPercentage = calculateProfileCompletion(profile, firstName, lastName, { instagram, facebook, soundcloud });
  $: nextRequiredField = getNextRequiredField(profileFields);
  
  // Kategorie-Fortschritte und Zustände
  let categoryStates: { [key: string]: boolean } = {};
  
  $: {
    // Initialisiere Zustände für neue Kategorien
    Object.keys(profileFields).forEach(category => {
      if (categoryStates[category] === undefined) {
        categoryStates[category] = false;
      }
    });
  }
  
  $: categoryProgress = Object.entries(profileFields).map(([category, fields]) => ({
    category,
    progress: calculateCategoryCompletion(fields),
    fields: fields.map(field => ({
      ...field,
      isComplete: !!field.value
    })),
    showChecklist: categoryStates[category]
  }));
</script>

<div class="space-y-4">
  <!-- Gesamtfortschritt -->
  <div class="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
    <div
      class="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
      style="width: {completionPercentage}%"
    />
  </div>
  <div class="text-center text-sm text-gray-400">
    Profil zu {completionPercentage}% vollständig
    {#if nextRequiredField}
      <p class="text-purple-400 mt-1">Nächster Schritt: {nextRequiredField}</p>
    {/if}
  </div>

  <!-- Kategorien-Fortschritt -->
  <div class="grid gap-4 mt-4">
    {#each categoryProgress as category}
      <div class="space-y-2">
        <button
          type="button"
          class="w-full flex justify-between items-center text-gray-400 hover:text-white transition-colors"
          on:click={() => categoryStates[category.category] = !categoryStates[category.category]}
        >
          <div class="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 transform transition-transform {category.showChecklist ? 'rotate-180' : ''}"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <h4 class="text-sm font-medium">{category.category}</h4>
          </div>
          <span class="text-sm text-gray-500">{category.progress}%</span>
        </button>
        
        <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            class="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
            style="width: {category.progress}%"
          />
        </div>
        
        <!-- Aufklappbare Checkliste -->
        {#if category.showChecklist}
          <div class="grid gap-1 mt-2 animate-fadeIn">
            {#each category.fields as field}
              <div class="flex items-center space-x-2">
                <div class={`w-4 h-4 rounded-full flex items-center justify-center ${field.isComplete ? 'bg-green-500' : 'bg-gray-700'}`}>
                  {#if field.isComplete}
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </div>
                <span class="text-sm text-gray-400">
                  {field.name}
                  {#if field.required && !field.isComplete}
                    <span class="text-yellow-500">*</span>
                  {/if}
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>