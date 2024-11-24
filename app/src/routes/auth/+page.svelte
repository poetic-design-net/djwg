<script lang="ts">
  import AuthSignIn from '$lib/components/AuthSignIn.svelte';
  import type { AuthPageData } from './+page';
  
  export let data: AuthPageData;
</script>

<AuthSignIn {data} />
