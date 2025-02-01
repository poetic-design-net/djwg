<script lang="ts">
  import type { Profile } from '$lib/types/profile';
  import { calculateProfileCompletion } from '$lib/utils/profile-utils';

  export let profile: Partial<Profile>;
  export let instagram: string;
  export let facebook: string;
  export let soundcloud: string;

  $: completionPercentage = calculateProfileCompletion(profile, { instagram, facebook, soundcloud });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium text-white">Profilfortschritt</h3>
    <span class="text-sm font-medium text-gray-400">{completionPercentage}%</span>
  </div>
  
  <div class="w-full bg-gray-900 rounded-full h-2.5">
    <div
      class="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
      style="width: {completionPercentage}%"
    />
  </div>
  
  {#if completionPercentage < 100}
    <p class="text-sm text-gray-400">
      Vervollständige dein Profil, um alle Features freizuschalten.
    </p>
  {:else}
    <p class="text-sm text-green-500">
      Glückwunsch! Dein Profil ist vollständig.
    </p>
  {/if}
</div>