<script lang="ts">
  import { PortableText } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import type { PortableTextComponents } from '@portabletext/svelte';
  import TextColor from './portable-text/TextColor.svelte';
  import HighlightColor from './portable-text/HighlightColor.svelte';
  
  export let value: PortableTextBlock[];
  export let className = "";
  
  const components: Partial<PortableTextComponents> = {
    marks: {
      textColor: TextColor,
      highlightColor: HighlightColor
    }
  };
</script>

{#if value}
<div class="prose prose-invert prose-xl max-w-none [&>*]:text-inherit [&>strong]:font-normal [&>em]:italic [&>a]:text-blue-500 hover:[&>a]:underline {className}">
  <PortableText {value} {components} />
</div>
{/if}