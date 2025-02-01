<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import { invalidateAll } from '$app/navigation';
  const dispatch = createEventDispatcher();
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { Profile, User } from '$lib/types/profile';
  import { calculateProfileCompletion } from '$lib/utils/profile-utils';

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

  // Basis-Felder
  let firstName = user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || '';
  let lastName = user.raw_user_meta_data?.last_name || user.user_metadata?.last_name || '';
  let email = user.email;
  
  // Profil-Daten
  let profile: Partial<Profile> = {};
  let showAddress = false;
  let showContact = false;
  
  // Social Media Links
  let instagram = '';
  let facebook = '';
  let soundcloud = '';

  // Berechne Profilfortschritt
  $: completionPercentage = calculateProfileCompletion(profile, firstName, lastName, { instagram, facebook, soundcloud });
  
  // Initialisiere Social Media Links wenn Profil geladen wird
  const initializeSocialLinks = (data: any) => {
    if (data?.social_links) {
      instagram = data.social_links.instagram || '';
      facebook = data.social_links.facebook || '';
      soundcloud = data.social_links.soundcloud || '';
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

  const handleSubmit = async () => {
    loading = true;
    error = '';

    try {
      // Hole zuerst die Badge-ID
      const { data: badgeData, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('slug', 'dj-level-1')
        .single();

      if (badgeError) throw badgeError;

      // Dann das Profil aktualisieren
      const profileData = {
        id: user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        username: `${firstName} ${lastName}`.trim().toLowerCase().replace(/\s+/g, '-'),
        ...profile,
        social_links: {
          instagram,
          facebook,
          soundcloud
        }
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Warte kurz, damit der Trigger das Badge vergeben kann
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Prüfe ob das Badge bereits existiert
      const { data: existingBadge, error: badgeCheckError } = await supabase
        .from('user_badges')
        .select('assigned_at')
        .eq('user_id', user.id)
        .eq('badge_id', badgeData.id)
        .maybeSingle();

      if (badgeCheckError) throw badgeCheckError;

      // Warte kurz und prüfe dann, ob ein neues Badge vergeben wurde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: newBadge } = await supabase
        .from('user_badges')
        .select('assigned_at')
        .eq('user_id', user.id)
        .eq('badge_id', badgeData.id)
        .maybeSingle();

      // Badge wurde neu vergeben wenn es vorher nicht existierte aber jetzt ja
      const badgeAwarded = !existingBadge && newBadge;

      // Dann erst den User updaten
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        email: email,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      });

      if (authError) throw authError;

      if (authData.user.user_metadata) {
        user.user_metadata = authData.user.user_metadata;
      }
      if (authData.user.email) {
        user.email = authData.user.email;
      }

      // Seite neu laden
      await invalidateAll();

      // Fenster schließen
      dispatch('close');

      // Toast anzeigen
      setTimeout(() => {
        toasts.success(
          completionPercentage === 100 && badgeAwarded
            ? '🎉 Profil aktualisiert und DJ Stufe 1 Badge erhalten!'
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
    {firstName}
    {lastName}
    {instagram}
    {facebook}
    {soundcloud}
  />

  <!-- Basis-Informationen -->
  <BasicInfo
    {email}
    {firstName}
    {lastName}
    {profile}
  />

  <!-- Profilbild -->
  <AvatarUpload
    {user}
    avatarUrl={profile.avatar_url}
    {firstName}
    {lastName}
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
    bind:soundcloud
  />

  <!-- Datei-Upload -->
  <FileUpload
    {user}
    {firstName}
    {lastName}
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