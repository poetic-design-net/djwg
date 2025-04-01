<script lang="ts">
  import { PortableText } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import type { PortableTextComponents } from '@portabletext/svelte';

  export let value: PortableTextBlock[];
  export let className = ""; // Optional: Erlaubt das Überschreiben von Styles

  const components: Partial<PortableTextComponents> = {
    types: {},
    marks: {},
    block: {},
    list: {},
    listItem: {}
  };
</script>

{#if value}
  <div class="prose prose-invert prose-xl max-w-none [&>*]:text-inherit [&>strong]:font-normal [&>em]:italic [&>a]:text-blue-500 hover:[&>a]:underline {className}">
    <PortableText {value} {components} />
  </div>
{/if}
