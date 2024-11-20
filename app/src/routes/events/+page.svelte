<script lang="ts">
  import Events from '$lib/components/Events.svelte';
  import { useQuery } from '@sanity/svelte-loader';
  import type { PageData } from './$types';

  export let data: PageData;
  const events = useQuery(data.events);
  $: eventsArray = $events?.data || [];
</script>

<div class="min-h-screen bg-black">
  <Events events={eventsArray} />
</div>
