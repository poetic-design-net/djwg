<script lang="ts">
  import AuthSignIn from '$lib/components/AuthSignIn.svelte';
  import type { AuthPageData } from './+page';
  
  export let data: AuthPageData;

  console.log('Auth Page Data:', data);
</script>

<AuthSignIn {data} />

{#if !data.user}
  <p>Debugging: No user data available</p>
{:else}
  <p>Debugging: User data available</p>
{/if}
