<script lang="ts">
  import { uploadToSanity } from '$lib/sanity/uploadMedia';
  import { fade } from 'svelte/transition';
  import { toasts } from '$lib/stores/toast';

  export let onUploadComplete: (id: string) => void;
  export let clearAfterSubmit = false;

  let uploading = false;
  let dragOver = false;
  let previewUrl: string | null = null;

  // Handle drag & drop
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
    const file = event.dataTransfer.files[0];
    if (file) await handleFile(file);
  }

  // Handle file selection
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    await handleFile(file);
  }

  export function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  // Process the file
  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toasts.error('Bitte nur Bilder hochladen (PNG, JPG, SVG)');
      return;
    }

    uploading = true;
    try {
      // Erstelle Preview
      previewUrl = URL.createObjectURL(file);

      // Upload zu Sanity
      const result = await uploadToSanity(
        file,
        'aussteller',
        'logo',
        'Aussteller Logo',
        'aussteller@example.com'
      );

      // Reset wenn clearAfterSubmit true ist
      if (clearAfterSubmit) {
        reset();
      }

      onUploadComplete(result.sanityId);
      toasts.success('Logo erfolgreich hochgeladen!');
    } catch (error) {
      console.error('Logo upload error:', error);
      toasts.error('Fehler beim Upload des Logos');
    } finally {
      uploading = false;
    }
  }

  // Cleanup preview URL when component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
</script>

<div class="space-y-4">
  <!-- Drop Zone -->
  <div
    class="relative {dragOver ? 'border-green-500' : 'border-gray-800'} rounded-xl bg-gray-950 px-4 py-8 border-2 border-dashed transition-colors duration-200"
    class:opacity-50={uploading}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
  >
    <input
      id="logo-upload"
      type="file"
      class="sr-only"
      on:change={handleFileSelect}
      accept="image/*"
      disabled={uploading}
    />
    
    <label
      for="logo-upload"
      class="relative cursor-pointer rounded-xl flex items-center justify-center"
    >
      {#if previewUrl}
        <div class="space-y-4 text-center">
          <img src={previewUrl} alt="Logo Preview" class="max-h-32 mx-auto" />
          <p class="text-sm text-gray-400">Klicke um ein anderes Logo hochzuladen</p>
        </div>
      {:else}
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
            <span>Logo hierher ziehen oder</span>
            <span class="text-green-500 hover:text-green-400"> durchsuchen</span>
          </div>
          <p class="text-xs text-gray-500">
            PNG, JPG oder SVG
          </p>
        </div>
      {/if}
    </label>
  </div>

  {#if uploading}
    <div class="text-sm text-gray-400 text-center" transition:fade>
      Logo wird hochgeladen...
    </div>
  {/if}
</div>