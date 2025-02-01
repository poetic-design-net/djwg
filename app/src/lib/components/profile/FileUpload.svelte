<script lang="ts">
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { getContext } from 'svelte';
  import { uploadToSanity } from '$lib/sanity/uploadMedia';
  import type { User } from '$lib/types/profile';

  export let user: User;
  export let firstName: string;
  export let lastName: string;

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;
  let success = false;
  let error = '';
  let selectedFile: File | null = null;

  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    selectedFile = input.files[0];
    loading = true;
    error = '';
    success = false;

    try {
      const { data: uploadData, error: dbError } = await supabase
        .from('media_uploads')
        .insert({
          user_id: user.id,
          original_filename: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          status: 'pending',
          metadata: {
            mime_type: selectedFile.type,
            last_modified: selectedFile.lastModified,
            storage_provider: 'sanity'
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!uploadData) throw new Error('Keine Daten vom Upload erhalten');

      const sanityResult = await uploadToSanity(
        selectedFile,
        user.id,
        uploadData.id,
        firstName || lastName || user.email?.split('@')[0] || 'Unbekannter Benutzer',
        user.email
      );

      // Aktualisiere den Eintrag mit den Sanity-Referenzen
      const { error: updateError } = await supabase
        .from('media_uploads')
        .update({
          sanity_id: sanityResult.sanityId,
          sanity_asset_id: sanityResult.sanityAssetId,
          metadata: {
            ...uploadData.metadata,
            sanity_url: sanityResult.url
          }
        })
        .eq('id', uploadData.id);

      if (updateError) throw updateError;
      success = true;
    } catch (err: any) {
      error = err?.message || 'Fehler beim Upload';
      console.error('Upload Fehler:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Medien hochladen</h3>

  <div class="space-y-2">
    <label
      for="file-upload"
      class="relative cursor-pointer rounded-xl bg-gray-950 px-4 py-4 border border-gray-800 hover:border-green-500 transition-colors duration-200 flex items-center justify-center"
    >
      <input
        id="file-upload"
        name="file-upload"
        type="file"
        class="sr-only"
        on:change={handleFileUpload}
        accept="image/*,video/*,audio/*"
      />
      <div class="space-y-1 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="text-sm text-gray-400">
          <span>Datei hierher ziehen oder</span>
          <span class="text-green-500 hover:text-green-400"> durchsuchen</span>
        </div>
        <p class="text-xs text-gray-500">
          Bilder, Videos oder Audio-Dateien
        </p>
      </div>
    </label>
    {#if selectedFile}
      <p class="text-sm text-gray-400">
        Ausgewählte Datei: {selectedFile.name}
      </p>
    {/if}
  </div>

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}

  {#if success}
    <p class="text-green-500 text-sm">Datei erfolgreich hochgeladen!</p>
  {/if}
</div>