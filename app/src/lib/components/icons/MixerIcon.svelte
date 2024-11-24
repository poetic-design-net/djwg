<script lang="ts">
  import { MusicalNoteIcon } from 'heroicons-svelte/24/outline';
  export let size = 24;
  export let class_name = '';
</script>

<MusicalNoteIcon {size} class={class_name} />
