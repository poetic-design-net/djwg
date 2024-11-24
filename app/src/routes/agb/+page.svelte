<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
</script>

<LegalPage title={data.page.title} content={data.page.content} />
