<script lang="ts">
  import EventDetail from '$lib/components/EventDetail.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import type { TransformedEvent } from '$lib/sanity/queries/events';

  export let data: {
    event: TransformedEvent;
  };

  $: ({ event } = data);

  // Ensure we always have a valid SEO object
  $: seo = event?.seo || {};
</script>

{#if event}
  <Seo 
    {seo}
    fallback={{
      title: event.title,
      description: event.description,
      image: event.image
    }}
  />
{/if}

<div class="min-h-screen bg-black">
  {#if event}
    <EventDetail {event} />
  {:else}
    <div class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-4xl text-white mb-4">Event nicht gefunden</h1>
      <p class="text-gray-400">Das angeforderte Event konnte nicht gefunden werden.</p>
      {#if import.meta.env.DEV}
        <pre class="mt-8 text-left text-xs text-gray-500 bg-black/20 p-4 rounded-lg overflow-auto">
          Debug Info:
          Event Data: {JSON.stringify(event, null, 2)}
        </pre>
      {/if}
    </div>
  {/if}
</div>
