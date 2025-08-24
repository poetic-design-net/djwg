<script lang="ts">
  import ExhibitionPlan from '$lib/components/exhibition/ExhibitionPlan.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<svelte:head>
  <title>Interaktiver Messeplan | DJ WORKG</title>
  <meta name="description" content="Erkunden Sie unseren interaktiven Messeplan. Finden Sie Aussteller, planen Sie Ihre Route und entdecken Sie neue Produkte und Dienstleistungen." />
</svelte:head>

<div class="h-[calc(100vh-5rem)] overflow-hidden">
  <ExhibitionPlan
    exhibitionHalls={data.halls}
    exhibitionStands={data.stands}
    exhibitionExhibitors={data.exhibitors}
    isAdmin={data.isAdmin}
  />
</div>