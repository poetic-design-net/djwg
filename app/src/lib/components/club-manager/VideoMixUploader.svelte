<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { EnrichedProfile } from '$lib/types/profile';
  
  export let dj: EnrichedProfile;
  
  const supabase = getContext<SupabaseClient>('supabase');
  
  let uploading = false;
  let error: string | null = null;
  let progress = 0;
  let fileInput: HTMLInputElement;

  const maxFileSize = 500 * 1024 * 1024; // 500MB
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  interface ProgressEvent {
    loaded: number;
    total: number;
  }

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    // Validierung
    if (!allowedTypes.includes(file.type)) {
      error = 'Bitte nur MP4, WebM oder QuickTime Videos hochladen.';
      return;
    }
    
    if (file.size > maxFileSize) {
      error = 'Die Datei ist zu groß. Maximale Größe ist 500MB.';
      return;
    }

    error = null;
    uploading = true;
    progress = 0;

    try {
      // Erstelle einen eindeutigen Dateinamen
      const fileExt = file.name.split('.').pop();
      const fileName = `${dj.id}-video-mix-${Date.now()}.${fileExt}`;
      const filePath = `video-mixes/${fileName}`;

      // Upload zur Storage
      const { error: uploadError, data } = await supabase.storage
        .from('dj-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Hole die öffentliche URL
      const { data: { publicUrl } } = supabase.storage
        .from('dj-uploads')
        .getPublicUrl(filePath);

      // Aktualisiere das Profil mit der Video-URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ video_mix_url: publicUrl })
        .eq('id', dj.id);

      if (updateError) throw updateError;

      // Aktualisiere die lokalen Daten
      dj.video_mix_url = publicUrl;

    } catch (err) {
      console.error('Upload error:', err);
      error = 'Fehler beim Hochladen des Videos. Bitte versuche es erneut.';
    } finally {
      uploading = false;
      progress = 0;
      if (fileInput) fileInput.value = ''; // Reset input
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }

  // Fortschritt manuell tracken
  function updateProgress(loaded: number, total: number) {
    progress = (loaded / total) * 100;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h4 class="text-sm font-medium text-gray-300">Video-Mix</h4>
  </div>

  <!-- Aktuelles Video anzeigen -->
  {#if dj.video_mix_url}
    <div class="relative bg-gray-800 rounded-lg overflow-hidden">
      <video 
        src={dj.video_mix_url} 
        controls 
        class="w-full"
        controlsList="nodownload"
      >
        <track kind="captions">
      </video>
    </div>
  {/if}

  <!-- Upload-Bereich -->
  <div class="mt-4">
    <input
      type="file"
      accept="video/mp4,video/webm,video/quicktime"
      class="hidden"
      bind:this={fileInput}
      on:change={handleFileSelect}
    >
    
    <button
      type="button"
      class="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      on:click={triggerFileInput}
      disabled={uploading}
    >
      {#if uploading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Video wird hochgeladen...
      {:else}
        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {dj.video_mix_url ? 'Neues Video hochladen' : 'Video hochladen'}
      {/if}
    </button>
  </div>

  <!-- Fortschrittsanzeige -->
  {#if uploading}
    <div class="mt-4">
      <div class="relative pt-1">
        <div class="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
          <div
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
            style="width: {progress}%"
          ></div>
        </div>
        <div class="text-right mt-1">
          <span class="text-sm font-semibold text-gray-400">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Fehleranzeige -->
  {#if error}
    <div class="mt-4 p-4 rounded-md bg-red-900/30 border border-red-800">
      <p class="text-sm text-red-400">{error}</p>
    </div>
  {/if}

  <!-- Hilfetext -->
  <div class="mt-2 text-sm text-gray-500">
    Unterstützte Formate: MP4, WebM, QuickTime<br>
    Maximale Dateigröße: 500MB
  </div>
</div>