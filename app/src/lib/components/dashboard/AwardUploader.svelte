<script lang="ts">
  import { getContext, createEventDispatcher } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { uploadToAward } from '$lib/sanity/uploadMedia';
  import { toasts } from '$lib/stores/toast';
  import type { User } from '$lib/types/profile';

  export let user: User;

  const supabase = getContext<SupabaseClient>('supabase');
  const dispatch = createEventDispatcher();
  let loading = false;
  let error = '';
  let success = false;
  let selectedFiles: File[] = [];
  let currentFileIndex = 0;
  let totalFiles = 0;
  let currentFileName = '';
  let uploadStage = '';
  let dragOver = false;
  let uploadPhase = 0;

  function truncateFilename(filename: string, maxLength: number = 25): string {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop() || '';
    const nameWithoutExt = filename.substring(0, filename.length - extension.length - 1);
    
    if (extension.length + 4 >= maxLength) {
      return filename.substring(0, maxLength - 3) + '...';
    }
    
    const truncatedLength = maxLength - extension.length - 4;
    return nameWithoutExt.substring(0, truncatedLength) + '...' + '.' + extension;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function handleDragLeave() {
    dragOver = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    if (!event.dataTransfer?.files) return;
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const files = Array.from(input.files);
    handleFiles(files);
  }

  function handleFiles(files: File[]) {
    selectedFiles = [...selectedFiles, ...files];
  }

  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }

  async function uploadFiles() {
    if (selectedFiles.length === 0) return;
    
    loading = true;
    error = '';
    success = false;
    totalFiles = selectedFiles.length;
    currentFileIndex = 0;
    uploadPhase = 0;

    try {
      for (const file of selectedFiles) {
        currentFileIndex++;
        currentFileName = file.name;
        uploadStage = 'Erstelle Datenbank-Eintrag...';
        uploadPhase = 1;

        const { data: uploadData, error: dbError } = await supabase
          .from('media_uploads')
          .insert({
            user_id: user.id,
            original_filename: file.name,
            file_type: file.type,
            file_size: file.size,
            status: 'pending',
            metadata: {
              mime_type: file.type,
              last_modified: file.lastModified,
              storage_provider: 'sanity',
              upload_type: 'award'
            }
          })
          .select()
          .single();

        if (dbError) throw dbError;
        if (!uploadData) throw new Error('Keine Daten vom Upload erhalten');

        uploadStage = 'Lade Datei hoch...';
        uploadPhase = 2;

        const sanityResult = await uploadToAward(
          file,
          user.id,
          uploadData.id,
          user.user_metadata?.name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'Unbekannter Benutzer',
          user.email
        );

        uploadStage = 'Aktualisiere Referenzen...';
        uploadPhase = 3;

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

        dispatch('uploadComplete', { fileId: uploadData.id });
        uploadPhase = 4;
        toasts.success('Upload erfolgreich!');
      }

      success = true;
      selectedFiles = [];
    } catch (err: any) {
      error = err?.message || 'Fehler beim Upload';
      toasts.error(error);
      uploadPhase = 0;
    } finally {
      loading = false;
    }
  }

  $: uploadProgress = totalFiles === 0 ? 0 : Math.max(0, Math.min(100, Math.round(
    ((currentFileIndex - 1 + uploadPhase / 4) / totalFiles) * 100
  )));
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Award Medien hochladen</h3><span class="text-sm text-gray-300">(Du findest deine hochgeladenen Dateien unter "Meine Uploads")</span>
   <div
    class="relative {dragOver ? 'border-green-500' : 'border-gray-800'} rounded-xl bg-gray-950 px-4 py-8 border-2 border-dashed transition-colors duration-200"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <input
      id="award-file-upload"
      type="file"
      multiple
      class="sr-only"
      on:change={handleFileSelect}
      accept="image/*,video/*,audio/*"
    />
    
    <label
      for="award-file-upload"
      class="relative cursor-pointer rounded-xl flex items-center justify-center"
    >
      <div class="space-y-4 text-center">
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
          <span>Dateien hierher ziehen oder</span>
          <span class="text-green-500 hover:text-green-400"> durchsuchen</span>
        </div>
        <p class="text-xs text-gray-500">
          Bilder, Videos oder Audio-Dateien für den Award
        </p>
      </div>
    </label>
  </div>

  {#if selectedFiles.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-400">Ausgewählte Dateien:</h4>
      <div class="space-y-2">
        {#each selectedFiles as file, index}
          <div class="flex items-center justify-between bg-gray-900 p-2 rounded-lg">
            <span class="text-sm text-gray-300 truncate flex-1">
              {truncateFilename(file.name)}
            </span>
            <button
              type="button"
              class="text-red-500 hover:text-red-400 ml-2 flex-shrink-0"
              on:click={() => removeFile(index)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>

    <button
      type="button"
      disabled={loading}
      on:click={uploadFiles}
      class="w-full px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if loading}
        Wird hochgeladen... {currentFileIndex} von {totalFiles}
      {:else}
        Dateien hochladen
      {/if}
    </button>

    {#if loading}
      <div class="mt-4 space-y-2">
        <div class="flex justify-between text-sm text-gray-400 mb-2">
          <span class="truncate flex-1">Aktueller Upload: {truncateFilename(currentFileName)}</span>
          <span class="ml-2 flex-shrink-0">{uploadProgress}%</span>
        </div>
        <div class="text-xs text-gray-500 truncate">{uploadStage}</div>
        <div class="w-full bg-gray-800 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all duration-300"
            style="width: {uploadProgress}%"
          />
        </div>
      </div>
    {/if}
  {/if}

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}
</div>