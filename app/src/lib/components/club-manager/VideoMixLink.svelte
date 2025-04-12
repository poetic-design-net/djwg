<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { EnrichedProfile } from '$lib/types/profile';
  
  export let dj: EnrichedProfile;
  
  const supabase = getContext<SupabaseClient>('supabase');
  
  let error: string | null = null;
  let inputUrl = dj.video_mix_url || '';
  let editing = false;

  // Validiere die URL und extrahiere die Video-ID
  function getVideoType(url: string): { type: string; id: string } | null {
    try {
      const urlObj = new URL(url);
      
      // YouTube
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const id = urlObj.searchParams.get('v') || urlObj.pathname.slice(1);
        return { type: 'youtube', id };
      }
      
      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const id = urlObj.pathname.split('/').pop() || '';
        return { type: 'vimeo', id };
      }
      
      // SoundCloud
      if (urlObj.hostname.includes('soundcloud.com')) {
        return { type: 'soundcloud', id: url };
      }

      return null;
    } catch {
      return null;
    }
  }

  async function saveUrl() {
    if (!inputUrl) {
      // Lösche die URL
      await updateProfile(undefined);
      editing = false;
      return;
    }

    const videoInfo = getVideoType(inputUrl);
    if (!videoInfo) {
      error = 'Bitte gib eine gültige YouTube, Vimeo oder SoundCloud URL ein.';
      return;
    }

    await updateProfile(inputUrl);
    editing = false;
  }

  async function updateProfile(url: string | undefined) {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ video_mix_url: url })
        .eq('id', dj.id);

      if (updateError) throw updateError;
      
      // Aktualisiere lokale Daten
      dj.video_mix_url = url;
      error = null;
    } catch (err) {
      console.error('Update error:', err);
      error = 'Fehler beim Speichern der URL.';
    }
  }

  // Rendere den entsprechenden Embedded Player
  function getEmbedCode(url: string): string {
    const videoInfo = getVideoType(url);
    if (!videoInfo) return '';

    switch (videoInfo.type) {
      case 'youtube':
        return `<iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/${videoInfo.id}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>`;
      
      case 'vimeo':
        return `<iframe
          width="100%"
          height="315"
          src="https://player.vimeo.com/video/${videoInfo.id}"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>`;
      
      case 'soundcloud':
        return `<iframe
          width="100%"
          height="166"
          scrolling="no"
          frameborder="no"
          src="https://w.soundcloud.com/player/?url=${encodeURIComponent(videoInfo.id)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
        ></iframe>`;
      
      default:
        return '';
    }
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h4 class="text-sm font-medium text-gray-300">Video/Audio Mix</h4>
    <button
      type="button"
      class="text-sm text-indigo-400 hover:text-indigo-300"
      on:click={() => editing = !editing}
    >
      {editing ? 'Abbrechen' : (dj.video_mix_url ? 'Bearbeiten' : 'Hinzufügen')}
    </button>
  </div>

  {#if editing}
    <div class="space-y-4">
      <input
        type="url"
        bind:value={inputUrl}
        placeholder="YouTube, Vimeo oder SoundCloud URL"
        class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          on:click={saveUrl}
        >
          Speichern
        </button>
      </div>

      {#if error}
        <p class="text-sm text-red-400">{error}</p>
      {/if}
    </div>
  {:else if dj.video_mix_url}
    <div class="bg-gray-800 rounded-lg overflow-hidden">
      {@html getEmbedCode(dj.video_mix_url)}
    </div>
  {:else}
    <p class="text-sm text-gray-500">Noch kein Video/Audio Mix hinzugefügt</p>
  {/if}

  <div class="text-xs text-gray-500">
    Unterstützte Plattformen: YouTube, Vimeo, SoundCloud
  </div>
</div>