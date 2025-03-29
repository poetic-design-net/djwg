<script lang="ts">
  import Events from '$lib/components/Events.svelte';
  import Areas from '$lib/components/Areas.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { useQuery } from '@sanity/svelte-loader';
  import type { PageData } from './$types';
  import type { EventPage } from '$lib/sanity/queries/events';

  export let data: PageData;
  const events = useQuery(data.events);
  const eventPage = useQuery<EventPage>(data.eventPage);
  $: eventsArray = $events?.data || [];
  $: pageSeo = $eventPage?.data?.seo;
  $: areas = $eventPage?.data?.areas || [];
</script>

<Seo seo={pageSeo} />

<div class="min-h-screen bg-black">
  <Events events={eventsArray} />
  <Areas {areas} />
</div>
