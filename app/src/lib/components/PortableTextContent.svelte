<script lang="ts">
  import { PortableText } from '@portabletext/svelte';
  import type { PortableTextBlock } from '@portabletext/types';
  import type { PortableTextComponents } from '@portabletext/svelte';

  export let value: PortableTextBlock[];

  const components: Partial<PortableTextComponents> = {};
</script>

<div class="prose prose-invert prose-xl max-w-none [&>p]:mb-4 [&>p:last-child]:mb-0">
  <PortableText {value} {components} />
</div>
