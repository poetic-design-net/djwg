<script lang="ts">
  import type { PortableTextComponents } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import { PortableText } from '@portabletext/svelte';

  export let title: string;
  export let content: PortableTextBlock[] = [];

  const components: Partial<PortableTextComponents> = {};
</script>

<div class="container mx-auto px-4 py-12 max-w-4xl">
  <div class="bg-black/40 border border-gray-800 rounded-3xl p-8">
    <h1 class="text-4xl font-bold mb-8 text-white">{title}</h1>
    
    <div class="prose text-white prose-lg max-w-none prose-invert prose-p:mb-6 prose-headings:mt-8 prose-headings:mb-4 prose-li:mb-2 prose-ul:mb-6 prose-ol:mb-6">
      <PortableText value={content} {components} />
    </div>
  </div>
</div>

<style>
  :global(.prose p) {
    margin-bottom: 1.5rem;
  }
  :global(.prose h2) {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  :global(.prose h3) {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  :global(.prose ul), :global(.prose ol) {
    margin-bottom: 1.5rem;
  }
  :global(.prose li) {
    margin-bottom: 0.5rem;
  }
</style>
