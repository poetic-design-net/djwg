<script lang="ts">
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { getContext, createEventDispatcher } from 'svelte';
  import { uploadToSanity } from '$lib/sanity/uploadMedia';
  import type { User } from '$lib/types/profile';
  import OptimizedAvatar from '$lib/components/OptimizedAvatar.svelte';

  export let user: User;
  export let avatarUrl: string | undefined = undefined;
  export let firstName: string;
  export let lastName: string;

  const dispatch = createEventDispatcher();
  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;
  let success = false;
  let error = '';

  // Upload Progress Tracking
  let uploadPhase = 0; // 0 = Start, 1 = DB-Eintrag, 2 = Sanity Upload, 3 = Referenz-Update, 4 = Fertig
  let uploadStage = '';
  let currentFileName = '';
  let currentProgress = 0;

  // Hilfsfunktion zum Kürzen langer Dateinamen
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

  async function handleAvatarDelete() {
    loading = true;
    error = '';
    success = false;
    uploadStage = 'Lösche Avatar...';
    currentProgress = 50;

    try {
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      avatarUrl = undefined;
      success = true;
      dispatch('profileUpdated', { profile: updatedProfile });
      uploadStage = 'Avatar gelöscht!';
      currentProgress = 100;
    } catch (err: any) {
      error = err?.message || 'Fehler beim Löschen des Avatars';
      console.error('Löschen Fehler:', err);
    } finally {
      loading = false;
      setTimeout(() => {
        if (success) {
          uploadStage = '';
          currentProgress = 0;
        }
      }, 2000);
    }
  }

  async function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    currentFileName = file.name;

    if (!file.type.startsWith('image/')) {
      error = 'Bitte nur Bilder hochladen';
      return;
    }

    uploadPhase = 0;
    currentProgress = 0;
    loading = true;
    error = '';
    success = false;

    try {
      // Phase 1: DB-Eintrag erstellen
      uploadStage = 'Erstelle Datenbank-Eintrag...';
      uploadPhase = 1;
      currentProgress = 25;

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
            usage: 'avatar'
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!uploadData) throw new Error('Keine Daten vom Upload erhalten');

      // Phase 2: Sanity Upload
      uploadStage = 'Lade Bild hoch...';
      uploadPhase = 2;
      currentProgress = 50;

      const sanityResult = await uploadToSanity(
        file,
        user.id,
        uploadData.id,
        firstName || lastName || user.email?.split('@')[0] || 'Unbekannter Benutzer',
        user.email
      );

      // Phase 3: Referenzen aktualisieren
      uploadStage = 'Aktualisiere Referenzen...';
      uploadPhase = 3;
      currentProgress = 75;

      const { error: updateError } = await supabase
        .from('media_uploads')
        .update({
          sanity_id: sanityResult.sanityId,
          sanity_asset_id: sanityResult.sanityAssetId,
          metadata: {
            ...uploadData.metadata,
            sanity_url: sanityResult.url
          },
          status: 'completed'
        })
        .eq('id', uploadData.id);

      if (updateError) throw updateError;

      // Phase 4: Profil aktualisieren
      uploadStage = 'Aktualisiere Profil...';
      uploadPhase = 4;
      currentProgress = 90;

      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: sanityResult.url,
          first_name: currentProfile.first_name,
          last_name: currentProfile.last_name
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      avatarUrl = sanityResult.url;
      success = true;
      currentProgress = 100;
      uploadStage = 'Upload abgeschlossen!';
      dispatch('profileUpdated', { profile: updatedProfile });
    } catch (err: any) {
      error = err?.message || 'Fehler beim Upload';
      console.error('Upload Fehler:', err);
      uploadPhase = 0;
    } finally {
      loading = false;
      if (success) {
        setTimeout(() => {
          uploadStage = '';
          currentProgress = 0;
          uploadPhase = 0;
        }, 2000);
      }
    }
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-white">Profilbild</h3>
  <div class="space-y-4">
    {#if avatarUrl}
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <OptimizedAvatar
            image={avatarUrl}
            size="md"
            border={true}
          />
        </div>
        <button
          on:click={handleAvatarDelete}
          class="px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 bg-gray-950 rounded-xl border border-gray-800 hover:border-red-500 transition-colors duration-200"
          disabled={loading}
        >
          Avatar löschen
        </button>
      </div>
    {/if}
    
    {#if !avatarUrl}
      <label
        for="avatar-upload"
        class="relative cursor-pointer rounded-xl bg-gray-950 px-4 py-4 border border-gray-800 hover:border-green-500 transition-colors duration-200 flex items-center justify-center"
      >
        <input
          id="avatar-upload"
          name="avatar-upload"
          type="file"
          class="sr-only"
          on:change={handleAvatarUpload}
          accept="image/*"
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
            <span>Profilbild hochladen</span>
            <span class="text-green-500 hover:text-green-400"> (max. 5MB)</span>
          </div>
          <p class="text-xs text-gray-500">
            PNG, JPG, GIF
          </p>
        </div>
      </label>
    {/if}
  </div>

  {#if loading}
    <div class="mt-4 space-y-2">
      <div class="flex justify-between text-sm text-gray-400 mb-2">
        <span class="truncate flex-1">Aktueller Vorgang: {truncateFilename(currentFileName)}</span>
        <span class="ml-2 flex-shrink-0">{currentProgress}%</span>
      </div>
      <div class="text-xs text-gray-500 truncate">{uploadStage}</div>
      <div class="w-full bg-gray-800 rounded-full h-2">
        <div
          class="bg-green-500 h-2 rounded-full transition-all duration-300"
          style="width: {currentProgress}%"
        />
      </div>
    </div>
  {/if}

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}

  {#if success}
    <p class="text-green-500 text-sm">Profilbild erfolgreich aktualisiert!</p>
  {/if}
</div>