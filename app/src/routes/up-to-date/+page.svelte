<script lang="ts">
  import type { PageData } from './$types'
  import BentoGrid from '$lib/components/BentoGrid.svelte'

  export let data: PageData
</script>

<div class="min-h-screen ">
  <BentoGrid socialLinks={data.socialMedia} />
</div>