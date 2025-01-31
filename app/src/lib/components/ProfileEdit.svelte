<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { uploadToSanity } from '$lib/sanity/uploadMedia';
  import { uploadClient } from '$lib/sanity/uploadClient';
  
  interface Profile {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
    address_street?: string;
    address_number?: string;
    address_city?: string;
    address_zip?: string;
    address_country?: string;
    phone?: string;
    bio?: string;
    company_name?: string;
    position?: string;
    social_links?: {
      instagram?: string;
      facebook?: string;
      soundcloud?: string;
      linkedin?: string;
    };
    is_public: boolean;
  }
  
  export let user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      name?: string;
    };
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;
  let success = false;
  let error = '';
  
  // Basis-Felder
  let firstName = user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || '';
  let lastName = user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || '';
  let email = user.email;
  
  // Profil-Daten
  let profile: Partial<Profile> = {};
  let showAddress = false;
  let showContact = false;
  let selectedFile: File | null = null;
  
  // Social Media Links
  let instagram = '';
  let facebook = '';
  let soundcloud = '';
  let linkedin = '';
  
  // Toggle Funktionen
  const toggleAddress = () => showAddress = !showAddress;
  const toggleContact = () => showContact = !showContact;
  
  // Initialisiere Social Media Links wenn Profil geladen wird
  const initializeSocialLinks = (data: any) => {
    if (data?.social_links) {
      instagram = data.social_links.instagram || '';
      facebook = data.social_links.facebook || '';
      soundcloud = data.social_links.soundcloud || '';
      linkedin = data.social_links.linkedin || '';
    }
  };
  
  // Lade das Profil beim Start
  const loadProfile = async () => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      if (data) {
        profile = data;
        initializeSocialLinks(data);
      }
    } catch (e: any) {
      console.error('Fehler beim Laden des Profils:', e);
    }
  };

  // Avatar-Upload Handler
  async function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      error = 'Bitte nur Bilder hochladen';
      return;
    }

    loading = true;
    error = '';
    success = false;

    try {
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

      const sanityResult = await uploadToSanity(
        file,
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

      // Aktualisiere das Profil mit der neuen Avatar-URL
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: sanityResult.url
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      profile.avatar_url = sanityResult.url;
      success = true;
    } catch (err: any) {
      error = err?.message || 'Fehler beim Upload';
      console.error('Upload Fehler:', err);
    } finally {
      loading = false;
    }
  }

  // Allgemeiner Datei-Upload Handler
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

  const handleSubmit = async () => {
    loading = true;
    error = '';
    success = false;

    try {
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        email: email,
        data: { 
          first_name: firstName,
          last_name: lastName
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: `${firstName} ${lastName}`.trim(),
          ...profile,
          social_links: {
            instagram,
            facebook,
            soundcloud,
            linkedin
          }
        });

      if (profileError) throw profileError;

      success = true;
      if (authData.user.user_metadata) {
        user.user_metadata = authData.user.user_metadata;
      }
      if (authData.user.email) {
        user.email = authData.user.email;
      }
      dispatch('close');
    } catch (e: any) {
      error = e?.message || 'Ein Fehler ist aufgetreten';
    } finally {
      loading = false;
    }
  };
  
  // Lade das Profil beim Komponenten-Mount
  loadProfile();
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Basis-Informationen -->
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-white">Basis-Informationen</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-400 mb-2">
          E-Mail
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-400 mb-2">
          Vorname
        </label>
        <input
          type="text"
          id="firstName"
          bind:value={firstName}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-400 mb-2">
          Nachname
        </label>
        <input
          type="text"
          id="lastName"
          bind:value={lastName}
          class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  </div>

  <!-- Profilbild -->
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-white">Profilbild</h3>
    <div class="space-y-4">
      {#if profile.avatar_url}
        <div class="flex items-center space-x-4">
          <img
            src={profile.avatar_url}
            alt="Aktuelles Profilbild"
            class="w-20 h-20 rounded-full object-cover border-2 border-green-500"
          />
        </div>
      {/if}
      
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
    </div>
  </div>

  <!-- Über mich -->
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-white">Über mich</h3>
    <div>
      <label for="bio" class="block text-sm font-medium text-gray-400 mb-2">Bio</label>
      <textarea
        id="bio"
        bind:value={profile.bio}
        rows="4"
        class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        placeholder="Erzähle etwas über dich..."
      ></textarea>
    </div>
  </div>

  <!-- Adresse -->
  <div class="space-y-4">
    <button
      type="button"
      on:click={toggleAddress}
      class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 transform transition-transform {showAddress ? 'rotate-180' : ''}"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
      <h3 class="text-lg font-medium">Adresse {showAddress ? 'ausblenden' : 'anzeigen'}</h3>
    </button>

    {#if showAddress}
      <div class="space-y-4 animate-fadeIn">
        <div>
          <label for="street" class="block text-sm font-medium text-gray-400 mb-2">Straße</label>
          <input
            type="text"
            id="street"
            bind:value={profile.address_street}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label for="number" class="block text-sm font-medium text-gray-400 mb-2">Hausnummer</label>
          <input
            type="text"
            id="number"
            bind:value={profile.address_number}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">
            <label for="zip" class="block text-sm font-medium text-gray-400 mb-2">PLZ</label>
            <input
              type="text"
              id="zip"
              bind:value={profile.address_zip}
              class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div class="col-span-2">
            <label for="city" class="block text-sm font-medium text-gray-400 mb-2">Stadt</label>
            <input
              type="text"
              id="city"
              bind:value={profile.address_city}
              class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div>
          <label for="country" class="block text-sm font-medium text-gray-400 mb-2">Land</label>
          <input
            type="text"
            id="country"
            bind:value={profile.address_country}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Kontakt & Social Media -->
  <div class="space-y-4">
    <button
      type="button"
      on:click={toggleContact}
      class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 transform transition-transform {showContact ? 'rotate-180' : ''}"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
      <h3 class="text-lg font-medium">Kontakt & Social Media {showContact ? 'ausblenden' : 'anzeigen'}</h3>
    </button>

    {#if showContact}
      <div class="space-y-4 animate-fadeIn">
        <div>
          <label for="website" class="block text-sm font-medium text-gray-400 mb-2">Website</label>
          <input
            type="url"
            id="website"
            bind:value={profile.website}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://"
          />
        </div>
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-400 mb-2">Telefon</label>
          <input
            type="tel"
            id="phone"
            bind:value={profile.phone}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label for="instagram" class="block text-sm font-medium text-gray-400 mb-2">Instagram</label>
          <input
            type="text"
            id="instagram"
            bind:value={instagram}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="@username"
          />
        </div>
        <div>
          <label for="facebook" class="block text-sm font-medium text-gray-400 mb-2">Facebook</label>
          <input
            type="text"
            id="facebook"
            bind:value={facebook}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="facebook.com/username"
          />
        </div>
        <div>
          <label for="soundcloud" class="block text-sm font-medium text-gray-400 mb-2">Soundcloud</label>
          <input
            type="text"
            id="soundcloud"
            bind:value={soundcloud}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="soundcloud.com/username"
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Datei-Upload -->
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
  </div>

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}

  {#if success}
    <p class="text-green-500 text-sm">Profil erfolgreich aktualisiert!</p>
  {/if}

  <button
    type="submit"
    disabled={loading}
    class="w-full px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? 'Wird gespeichert...' : 'Speichern'}
  </button>
</form>

<style>
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>