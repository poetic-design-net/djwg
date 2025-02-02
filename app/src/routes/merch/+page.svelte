<script lang="ts">
  import type { PageData } from './$types';
  import Hero from '$lib/components/merch/Hero.svelte';
  import Merch from '$lib/components/Merch.svelte';

  export let data: PageData;
  const { merchPage } = data;
</script>

<Hero 
  eyebrow={merchPage.hero.eyebrow}
  title={merchPage.hero.title}
  description={merchPage.hero.description}
  backgroundImage={merchPage.hero.backgroundImage}
/>

<Merch 
  eyebrow={merchPage.section.eyebrow}
  title={merchPage.section.title}
  description={merchPage.section.description}
  products={merchPage.products}
/>