<script lang="ts">
  import EventDetail from '$lib/components/EventDetail.svelte';
  import Seo from '$lib/components/Seo.svelte';

  interface Event {
    _id: string;
    title: string;
    tag: string;
    subtitle: string;
    description: string;
    date: string;
    location: string;
    features?: string[];
    image: string;
    highlights: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    schedule?: {
      _id: string;
      days: Array<{
        date: string;
        stages: Array<{
          name: string;
          description: string;
          schedule: Array<{
            time: string;
            title: string;
            description?: string;
            instructor?: {
              name: string;
              role: string;
              image?: string;
            };
            icon?: string;
          }>;
        }>;
      }>;
    };
    gallery?: string[];
    locationDetails?: {
      name: string;
      description: string;
      image: string;
    };
    hasOpenStage?: boolean;
    isOpenStageSecret?: boolean;
    isLocationSecret?: boolean;
    isArtistsSecret?: boolean;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
    };
  }

  export let data: {
    event: Event;
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
