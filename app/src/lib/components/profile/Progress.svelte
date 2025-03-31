<script lang="ts">
 import type { Profile } from '$lib/types/profile';
 import { profileProgress } from '$lib/stores/profile-progress';
 import { onMount, afterUpdate } from 'svelte';

 export let profile: Partial<Profile>;
 export let instagram: string = '';
 export let facebook: string = '';
 export let soundcloud: string = '';

 function formatNextField(field: string): string {
   return field.replace('Basis-Informationen:', 'Basisdaten:');
 }

 // Erstes Update beim Montieren
 onMount(() => {
   if (profile) {
     profileProgress.update(profile, { instagram, facebook, soundcloud });
   }
 });

 // Aktualisiere Store, wenn sich Props ändern
 $: if (profile) {
   profileProgress.update(profile, { instagram, facebook, soundcloud });
 }

 // Zusätzliches Update nach jedem Rendering-Zyklus
 afterUpdate(() => {
   if (profile) {
     profileProgress.update(profile, { instagram, facebook, soundcloud });
   }
 });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium text-white">Profilfortschritt</h3>
    <span class="text-sm font-medium text-gray-400">{$profileProgress.percentage}%</span>
  </div>
  
  <div class="w-full bg-gray-900 rounded-full h-2.5">
    <div
      class="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
      style="width: {$profileProgress.percentage}%"
    />
  </div>
  
  {#if $profileProgress.percentage < 100}
    <p class="text-sm text-gray-400">
      {#if $profileProgress.nextRequiredField}
        Noch fehlt: <span class="text-yellow-400">{formatNextField($profileProgress.nextRequiredField)}</span>
      {:else}
        Fast geschafft! Fülle noch die restlichen Felder aus.
      {/if}
    </p>
  {:else}
    <p class="text-sm text-green-500">
      Glückwunsch! Dein Profil ist zu 100% ausgefüllt.
    </p>
  {/if}
</div>