<script lang="ts">
  import TestimonialsAll from '$lib/components/TestimonialsAll.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="min-h-screen bg-black">
  <div class="py-20">
    <TestimonialsAll testimonials={data.testimonials} />
  </div>
</div>

<style>
  :global(body) {
    background-color: black;
  }
</style>
