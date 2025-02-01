<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';

  export let user: {
    id: string;
    email: string;
  };

  const supabase = getContext<SupabaseClient>('supabase');
  let files: any[] = [];
  let loading = true;
  let error = '';

  // Lade die Dateien des Benutzers
  async function loadFiles() {
    try {
      const { data, error: filesError } = await supabase
        .from('media_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      files = data || [];
    } catch (err: any) {
      error = err?.message || 'Fehler beim Laden der Dateien';
      console.error('Fehler beim Laden der Dateien:', err);
    } finally {
      loading = false;
    }
  }

  // Datei löschen
  async function deleteFile(fileId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('media_uploads')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;
      
      // Aktualisiere die Liste nach dem Löschen
      files = files.filter(file => file.id !== fileId);
    } catch (err: any) {
      error = err?.message || 'Fehler beim Löschen der Datei';
      console.error('Fehler beim Löschen:', err);
    }
  }

  // Formatiere die Dateigröße
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Formatiere das Datum
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onMount(() => {
    loadFiles();
  });
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Meine Dateien</h3>

  {#if loading}
    <p class="text-gray-400">Lädt...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else if files.length === 0}
    <p class="text-gray-400">Keine Dateien gefunden</p>
  {:else}
    <div class="space-y-2">
      {#each files as file}
        <div class="bg-gray-900 p-4 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Vorschau für Bilder -->
              {#if file.metadata?.sanity_url && file.file_type.startsWith('image/')}
                <img
                  src={file.metadata.sanity_url}
                  alt={file.original_filename}
                  class="w-12 h-12 object-cover rounded-lg"
                />
              {:else}
                <!-- Icon für andere Dateitypen -->
                <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {file.original_filename}
                </p>
                <p class="text-xs text-gray-400">
                  {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              {#if file.metadata?.sanity_url}
                <a
                  href={file.metadata.sanity_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-green-500 hover:text-green-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              {/if}

              <button
                type="button"
                class="text-red-500 hover:text-red-400"
                on:click={() => deleteFile(file.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>