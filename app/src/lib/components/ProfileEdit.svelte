<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import { invalidateAll } from '$app/navigation';
  const dispatch = createEventDispatcher();
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Profile, User, StandardUserMetadata } from '$lib/types/profile';
  import { badgeStore } from '$lib/stores/badges';
  import { 
    calculateProfileCompletion, 
    normalizeUserMetadata,
    generateUsername 
  } from '$lib/utils/profile-utils';
  import { manageBadgesRealtime } from '$lib/services/badge-service';

  // Komponenten
  import Progress from './profile/Progress.svelte';
  import BasicInfo from './profile/BasicInfo.svelte';
  import AvatarUpload from './profile/AvatarUpload.svelte';
  import AboutMe from './profile/AboutMe.svelte';
  import Address from './profile/Address.svelte';
  import Contact from './profile/Contact.svelte';
  import FileUpload from './profile/FileUpload.svelte';

  export let user: User;
  const supabase = getContext<SupabaseClient>('supabase');
  
  let loading = false;
  let error = '';

  // Normalisiere die Benutzerdaten
  const normalizedMetadata = normalizeUserMetadata(user);
  
  // Initialisiere das Profil mit den normalisierten Daten
  let profile: Partial<Profile> = {
    first_name: normalizedMetadata.first_name,
    last_name: normalizedMetadata.last_name,
    email: normalizedMetadata.email,
    avatar_url: normalizedMetadata.avatar_url
  };
  
  let showAddress = true;  // Standardmäßig aufgeklappt
  let showContact = true;  // Standardmäßig aufgeklappt
  
  // Social Media Links
  let instagram = '';
  let facebook = '';
  let soundcloud = '';
  
  // Social Media Aktivierungsstatus
  let isInstagramEnabled = false;
  let isFacebookEnabled = false;
  let isSoundcloudEnabled = false;

  // Berechne Profilfortschritt
  $: completionPercentage = calculateProfileCompletion(
    profile,
    {
      instagram: isInstagramEnabled ? instagram : undefined,
      facebook: isFacebookEnabled ? facebook : undefined,
      soundcloud: isSoundcloudEnabled ? soundcloud : undefined
    }
  );
  
  // Initialisiere Social Media Links wenn Profil geladen wird
  const initializeSocialLinks = (data: any) => {
    if (data?.social_links) {
      instagram = data.social_links.instagram || '';
      isInstagramEnabled = !!data.social_links.instagram;
      facebook = data.social_links.facebook || '';
      isFacebookEnabled = !!data.social_links.facebook;
      soundcloud = data.social_links.soundcloud || '';
      isSoundcloudEnabled = !!data.social_links.soundcloud;
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
        profile = {
          ...profile,
          ...data,
          // Stelle sicher, dass die normalisierten Daten Vorrang haben
          first_name: profile.first_name || data.first_name,
          last_name: profile.last_name || data.last_name,
          email: profile.email || data.email
        };
        initializeSocialLinks(data);
      }
    } catch (e: any) {
      console.error('Fehler beim Laden des Profils:', e);
    }
  };

  const handleSubmit = async () => {
    loading = true;
    error = '';

    try {
      // Generiere Username falls nicht vorhanden
      if (!profile.username) {
        profile.username = generateUsername(profile.first_name || '', profile.last_name || '');
      }

      // 1. Aktualisiere die Auth Metadaten
      const metadataUpdate: StandardUserMetadata = {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || user.email,
        avatar_url: profile.avatar_url,
        provider: normalizedMetadata.provider,
        provider_id: normalizedMetadata.provider_id
      };

      const { data: authData, error: authError } = await supabase.auth.updateUser({
        email: profile.email || user.email,
        data: metadataUpdate
      });

      if (authError) throw authError;

      // 2. Aktualisiere das Profil
      const profileData: Partial<Profile> = {
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email || user.email,
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        website: profile.website,
        address_street: profile.address_street,
        address_number: profile.address_number,
        address_city: profile.address_city,
        address_zip: profile.address_zip,
        address_country: profile.address_country,
        phone: profile.phone,
        social_links: {
          // Nur aktivierte Social Media Profile speichern
          ...(isInstagramEnabled && instagram ? { instagram } : {}),
          ...(isFacebookEnabled && facebook ? { facebook } : {}),
          ...(isSoundcloudEnabled && soundcloud ? { soundcloud } : {})
        },
        is_public: profile.is_public ?? false
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Verwende die neue Echtzeit-Badge-Verwaltung
      // Lade das aktualisierte Profil
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // Prüfe und aktualisiere Badges in Echtzeit
      await manageBadgesRealtime(supabase, user.id, updatedProfile);
      
      // Bestimme, ob ein Badge hinzugefügt wurde (für Toast-Nachricht)
      const { data: badgeData } = await supabase
        .from('badges')
        .select('*')
        .eq('slug', 'dj-level-1')
        .single();
        
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badgeData?.id)
        .maybeSingle();
        
      const badgeAdded = !!existingBadge;

      // Seite neu laden
      await invalidateAll();

      // Fenster schließen
      dispatch('close');

      // Toast anzeigen
      setTimeout(() => {
        toasts.success(
          badgeAdded
            ? '🎉 DJ Stufe 1 Badge freigeschaltet!'
            : 'Profil erfolgreich aktualisiert!'
        );
      }, 100);

    } catch (e: any) {
      error = e?.message || 'Ein Fehler ist aufgetreten';
      toasts.error(error);
    } finally {
      loading = false;
    }
  };
  
  // Lade das Profil beim Komponenten-Mount
  loadProfile();
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <!-- Fortschrittsanzeige -->
  <Progress
    {profile}
    {instagram}
    {facebook}
    {soundcloud}
  />

  <!-- Basis-Informationen -->
  <BasicInfo
    {profile}
  />

  <!-- Profilbild -->
  <AvatarUpload
    {user}
    avatarUrl={profile.avatar_url}
    firstName={profile.first_name || ''}
    lastName={profile.last_name || ''}
    on:profileUpdated={loadProfile}
  />

  <!-- Über mich -->
  <AboutMe {profile} />

  <!-- Adresse -->
  <Address
    {profile}
    bind:showAddress
  />

  <!-- Kontakt & Social Media -->
  <Contact
    {profile}
    bind:showContact
    bind:instagram
    bind:facebook
    bind:isInstagramEnabled
    bind:isFacebookEnabled
    bind:isSoundcloudEnabled
    bind:soundcloud
  />

  <!-- Datei-Upload -->
  <FileUpload
    {user}
    firstName={profile.first_name || ''}
    lastName={profile.last_name || ''}
  />

  {#if error}
    <p class="text-red-500 text-sm">{error}</p>
  {/if}

  <div class="flex gap-4">
    <button
      type="submit"
      disabled={loading}
      class="flex-1 px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Wird gespeichert...' : 'Speichern'}
    </button>
  </div>
</form>
