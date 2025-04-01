<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { invalidate } from '$app/navigation';
  import { toasts } from '$lib/stores/toast';

  const dispatch = createEventDispatcher();
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Profile, User, StandardUserMetadata } from '$lib/types/profile';
  import { profileProgress } from '$lib/stores/profile-progress';
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
  export let profile: Partial<Profile>;
  const supabase = getContext<SupabaseClient>('supabase');
  
  let loading = false;
  let error = '';

  // Initialisiere das Profil mit normalisierten Daten, wenn keine existieren
  $: if (!profile) {
    const normalizedMetadata = normalizeUserMetadata(user);
    profile = {
      first_name: normalizedMetadata.first_name,
      last_name: normalizedMetadata.last_name,
      email: normalizedMetadata.email,
      avatar_url: normalizedMetadata.avatar_url
    };
  }

  let showAddress = true;  // Standardmäßig aufgeklappt
  let showContact = true;  // Standardmäßig aufgeklappt
  
  // Social Media Links
  let instagram = profile?.social_links?.instagram || '';
  let facebook = profile?.social_links?.facebook || '';
  let soundcloud = profile?.social_links?.soundcloud || '';
  
  // Social Media Aktivierungsstatus
  let isInstagramEnabled = !!profile?.social_links?.instagram;
  let isFacebookEnabled = !!profile?.social_links?.facebook;
  let isSoundcloudEnabled = !!profile?.social_links?.soundcloud;

  // Update Store bei jeder Änderung
  $: if (profile) {
    profileProgress.update(profile, { instagram, facebook, soundcloud });
  }

  // Berechne Profilfortschritt
  $: completionPercentage = calculateProfileCompletion(
    profile,
    {
      instagram: isInstagramEnabled ? instagram : undefined,
      facebook: isFacebookEnabled ? facebook : undefined,
      soundcloud: isSoundcloudEnabled ? soundcloud : undefined
    }
  );

  async function handleAvatarUpdate(event: CustomEvent) {
    const updatedProfile = event.detail.profile;
    if (updatedProfile) {
      // Aktualisiere lokales Profil
      profile = { ...profile, ...updatedProfile };
      
      // Aktualisiere den Store explizit
      setTimeout(() => {
        profileProgress.update(
          profile,
          profile.social_links || { instagram: '', facebook: '', soundcloud: '' }
        );
      }, 100);

      await invalidate('app:profile');
    }
  }

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
        provider: normalizeUserMetadata(user).provider,
        provider_id: normalizeUserMetadata(user).provider_id
      };

      const { error: authError } = await supabase.auth.updateUser({
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
        address_city: profile.address_city,
        website: profile.website,
        phone: profile.phone,
        social_links: {
          ...(isInstagramEnabled && instagram ? { instagram } : {}),
          ...(isFacebookEnabled && facebook ? { facebook } : {}),
          ...(isSoundcloudEnabled && soundcloud ? { soundcloud } : {})
        },
        is_public: profile.is_public ?? false
      };

      // Update in der Datenbank
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 3. Lade das aktualisierte Profil
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        // Update lokales Profil
        profile = { ...profile, ...updatedProfile };
        
        // Explizit den Store aktualisieren mit dem neuen Profil
        profileProgress.update(
          profile,
          {
            instagram: profile.social_links?.instagram || '',
            facebook: profile.social_links?.facebook || '',
            soundcloud: profile.social_links?.soundcloud || ''
          }
        );

        // Prüfe Badges
        await manageBadgesRealtime(supabase, user.id, updatedProfile);

        // Badge-Check für Toast
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

        // Invalidiere Serverdaten
        await invalidate('app:profile');

        // Wichtig: Warte einen Moment, bis die Store-Änderungen propagiert sind
        // bevor wir das Dialog-Fenster schließen
        setTimeout(() => {
          // Fenster schließen
          dispatch('close');

          // Toast anzeigen
          toasts.success(
            badgeAdded
              ? '🎉 DJ Stufe 1 Badge freigeschaltet!'
              : 'Profil erfolgreich aktualisiert!'
          );
        }, 200);
      }
    } catch (e: any) {
      error = e?.message || 'Ein Fehler ist aufgetreten';
      toasts.error(error);
    } finally {
      loading = false;
    }
  };
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
    on:profileUpdated={handleAvatarUpdate}
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
