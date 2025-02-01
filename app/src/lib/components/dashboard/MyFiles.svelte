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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              {/if}

              <button
                type="button"
                class="text-red-500 hover:text-red-400"
                on:click={() => deleteFile(file.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>