<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { uploadToSanity } from '$lib/sanity/uploadMedia';

  export let user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      name?: string;
    };
  };

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;
  let error = '';
  let success = false;
  let selectedFiles: File[] = [];
  let dragOver = false;

  // Drag & Drop Handlers
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

  // File Input Handler
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const files = Array.from(input.files);
    handleFiles(files);
  }

  // Process selected files
  function handleFiles(files: File[]) {
    selectedFiles = [...selectedFiles, ...files];
  }

  // Remove file from selection
  function removeFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }

  // Upload all selected files
  async function uploadFiles() {
    if (selectedFiles.length === 0) return;
    
    loading = true;
    error = '';
    success = false;

    try {
      for (const file of selectedFiles) {
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
              storage_provider: 'sanity'
            }
          })
          .select()
          .single();

        if (dbError) throw dbError;
        if (!uploadData) throw new Error('Keine Daten vom Upload erhalten');

        const sanityResult = await uploadToSanity(
          file,
          user.id,
          uploadData.id,
          user.user_metadata?.name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'Unbekannter Benutzer',
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
      }

      success = true;
      selectedFiles = []; // Clear selection after successful upload
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

  <!-- Drag & Drop Zone -->
  <div
    class="relative {dragOver ? 'border-green-500' : 'border-gray-800'} rounded-xl bg-gray-950 px-4 py-8 border-2 border-dashed transition-colors duration-200"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <input
      id="file-upload"
      type="file"
      multiple
      class="sr-only"
      on:change={handleFileSelect}
      accept="image/*,video/*,audio/*"
    />
    
    <label
      for="file-upload"
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
          Bilder, Videos oder Audio-Dateien
        </p>
      </div>
    </label>
  </div>

  <!-- Selected Files List -->
  {#if selectedFiles.length > 0}
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-400">Ausgewählte Dateien:</h4>
      <div class="space-y-2">
        {#each selectedFiles as file, index}
          <div class="flex items-center justify-between bg-gray-900 p-2 rounded-lg">
            <span class="text-sm text-gray-300">{file.name}</span>
            <button
              type="button"
              class="text-red-500 hover:text-red-400"
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

    <!-- Upload Button -->
    <button
      type="button"
      disabled={loading}
      on:click={uploadFiles}
      class="w-full px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Wird hochgeladen...' : 'Dateien hochladen'}
    </button>
  {/if}

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}

  {#if success}
    <p class="text-green-500 text-sm">Upload erfolgreich!</p>
  {/if}
</div>