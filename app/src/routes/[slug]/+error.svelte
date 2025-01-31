<script lang="ts">
  import { page } from '$app/stores';
  import AccessDenied from '$lib/components/errors/AccessDenied.svelte';

  // Der error.data enthält die requiredBadges, die wir im +page.server.ts übergeben
  import { AccessDeniedError } from '$lib/utils/errors';
  
  $: isAccessDeniedError = $page.error instanceof AccessDeniedError;
  $: requiredBadges = isAccessDeniedError ? ($page.error as AccessDeniedError).requiredBadges : [];
  $: isAccessDenied = $page.status === 403;
</script>

{#if isAccessDenied}
  <AccessDenied {requiredBadges} />
{:else}
  <div class="min-h-[50vh] flex items-center justify-center">
    <div class="max-w-2xl mx-auto text-center px-4">
      <h1 class="text-3xl font-bold mb-4">Fehler {$page.status}</h1>
      <p class="text-xl">{$page.error?.message || 'Ein Fehler ist aufgetreten'}</p>
    </div>
  </div>
{/if}