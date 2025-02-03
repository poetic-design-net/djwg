<script lang="ts">
  import { page } from '$app/stores';
  import type { TransformedEvent } from '$lib/sanity/queries/events';

  export let event: TransformedEvent;

  function getImageUrl(image: any): string | undefined {
    if (typeof image === 'object' && image !== null) {
      if ('asset' in image && typeof image.asset === 'object' && image.asset !== null && 'url' in image.asset) {
        return `${image.asset.url}?w=1920&fm=jpg&q=85&auto=format`;
      }
    }
    return undefined;
  }

  $: startDate = event.schedule?.days?.[0]?.date;
  $: endDate = event.schedule?.days?.[event.schedule.days.length - 1]?.date;

  $: imageUrl = getImageUrl(event.image);

  $: structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(event.locationDetails && {
      location: {
        '@type': 'Place',
        name: event.locationDetails.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: event.locationDetails.description,
          addressLocality: event.locationDetails.name,
          addressCountry: 'DE'
        }
      }
    }),
    ...(event.description && { description: event.description }),
    ...(imageUrl && { image: imageUrl }),
    url: $page.url.href,
    ...(event.tickets && {
      offers: event.tickets.map(ticket => ({
        '@type': 'Offer',
        name: ticket.title,
        price: ticket.price,
        priceCurrency: ticket.currency || 'EUR',
        url: $page.url.href
      }))
    }),
    ...(event.artists && {
      performer: event.artists.map(artist => ({
        '@type': 'PerformingGroup',
        name: artist.name
      }))
    })
  };

  $: jsonLd = JSON.stringify(structuredData);
</script>

<svelte:head>
 {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>