<script lang="ts">
  import {
    MusicalNoteIcon,
    SpeakerWaveIcon,
    PlayCircleIcon,
    ComputerDesktopIcon,
    MicrophoneIcon,
    CommandLineIcon
  } from 'heroicons-svelte/24/outline';

  export let name: 'mixer' | 'headphones' | 'vinyl' | 'laptop' | 'microphone' | 'controller';
  export let size = 24;
  export let class_name = '';

  const icons = {
    mixer: MusicalNoteIcon,
    headphones: SpeakerWaveIcon,
    vinyl: PlayCircleIcon,
    laptop: ComputerDesktopIcon,
    microphone: MicrophoneIcon,
    controller: CommandLineIcon
  };

  $: IconComponent = icons[name];
  $: style = `width: ${size}px; height: ${size}px;`;
</script>

<span class="inline-block" {style}>
  <svelte:component this={IconComponent} class={class_name} width={size} height={size} aria-hidden="true" />
</span>
