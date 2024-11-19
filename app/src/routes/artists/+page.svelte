<script lang="ts">
  import ArtistsGrid from '$lib/components/ArtistsGrid.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

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
