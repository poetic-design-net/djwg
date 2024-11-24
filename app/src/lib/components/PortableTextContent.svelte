<script lang="ts">
  import { PortableText } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import type { PortableTextComponents } from '@portabletext/svelte';

  export let value: PortableTextBlock[];

  const components: Partial<PortableTextComponents> = {
    types: {},
    marks: {},
    block: {},
    list: {},
    listItem: {}
  };
</script>

{#if value}
  <div class="prose prose-invert prose-xl max-w-none [&>p]:mb-4 [&>p:last-child]:mb-0 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mb-3 [&>h4]:text-xl [&>h4]:font-bold [&>h4]:mb-2 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:mb-4 [&>li]:mb-1 [&>strong]:font-bold [&>em]:italic [&>a]:text-blue-500 hover:[&>a]:underline">
    <PortableText {value} {components} />
  </div>
{/if}
