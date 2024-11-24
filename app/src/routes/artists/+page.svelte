<script lang="ts">
  import ArtistsGrid from '$lib/components/ArtistsGrid.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  // Default SEO for artists listing page
  const seo = {
    metaTitle: 'Unsere Artists | DJ Workshop Germany',
    metaDescription: 'Entdecke unsere talentierten DJs und Produzenten. Lerne von erfahrenen Künstlern in unseren Workshops.',
    ogImage: '/assets/home_hero.jpg'
  };
</script>

<Seo {seo} />

<div class="min-h-screen bg-black">
  <div class="py-20">
    <ArtistsGrid artists={data.artists} isLineupRevealed={data.isLineupRevealed} />
  </div>
</div>

<style>
  :global(body) {
    background-color: black;
  }
</style>
