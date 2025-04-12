<!-- Die ersten 110 Zeilen bleiben unverändert -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { User } from '$lib/types/profile';
  import VideoMixUploader from '../club-manager/VideoMixUploader.svelte';
  import VideoMixLink from '../club-manager/VideoMixLink.svelte';
  
  // DJ Urlaub Badge ID
  const DJ_URLAUB_BADGE_ID = '551d9015-aa13-4117-8776-b59f1aaade9b';
  
  export let user: User;
  
  // Supabase Client
  const supabase = getContext<SupabaseClient>('supabase');

  // Status-Optionen für Verfügbarkeit
  const statusOptions = [
    { value: 'available' as const, label: 'Verfügbar', color: 'bg-green-500' },
    { value: 'tentative' as const, label: 'Eventuell', color: 'bg-yellow-500' },
    { value: 'requested' as const, label: 'Angefragt', color: 'bg-blue-500' },
    { value: 'booked' as const, label: 'Gebucht', color: 'bg-red-500' }
  ];
  
  interface Availability {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    status: 'available' | 'tentative' | 'requested' | 'booked';
    created_at: string;
    updated_at: string;
  }
  
  // Rest des Scripts bleibt unverändert -->
  $: canAccess = user.badges?.some(badge => badge.badge_id === DJ_URLAUB_BADGE_ID) || false;
  
  let profileData = {
    email: user.email || '',
    phone: '',
    website: '',
    travel_group_size: '',
    travel_group_ages: '',
    visited_clubs: [] as string[],
    biography: '',
    social_links: {
      instagram: '',
      facebook: '',
      soundcloud: ''
    }
  };
  
  let availabilities: Availability[] = [];
  let loading_profile = false;
  let loading = false;
  let error: string | null = null;
  
  let newAvailability = {
    start_date: '',
    end_date: '',
    status: 'available' as const
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  async function loadProfileData() {
    if (!canAccess) return;
    
    loading_profile = true;
    error = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        profileData = {
          email: data.email || user.email || '',
          phone: data.phone || '',
          website: data.website || '',
          travel_group_size: data.travel_group_size || '',
          travel_group_ages: data.travel_group_ages || '',
          visited_clubs: data.visited_clubs || [],
          biography: data.biography || '',
          social_links: data.social_links || {
            instagram: '',
            facebook: '',
            soundcloud: ''
          }
        };
      }
    } catch (err) {
      console.error('Fehler beim Laden der Profildaten:', err);
      error = 'Profildaten konnten nicht geladen werden.';
    } finally {
      loading_profile = false;
    }
  }

  async function saveProfileData() {
    if (!canAccess) return;
    
    loading_profile = true;
    error = null;
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: profileData.phone,
          website: profileData.website,
          travel_group_size: profileData.travel_group_size,
          travel_group_ages: profileData.travel_group_ages,
          visited_clubs: profileData.visited_clubs,
          biography: profileData.biography,
          social_links: profileData.social_links
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
    } catch (err) {
      console.error('Fehler beim Speichern der Profildaten:', err);
      error = 'Profildaten konnten nicht gespeichert werden.';
    } finally {
      loading_profile = false;
    }
  }
  
  async function loadAvailabilities() {
    if (!canAccess) return;
    
    loading = true;
    error = null;
    
    try {
      const { data, error: fetchError } = await supabase
        .from('dj_availability')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      availabilities = data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Verfügbarkeiten:', err);
      error = 'Verfügbarkeiten konnten nicht geladen werden.';
    } finally {
      loading = false;
    }
  }
  
  async function addAvailability() {
    if (!newAvailability.start_date || !newAvailability.end_date) {
      error = 'Bitte Start- und Enddatum angeben.';
      return;
    }
    
    if (new Date(newAvailability.start_date) > new Date(newAvailability.end_date)) {
      error = 'Das Startdatum muss vor dem Enddatum liegen.';
      return;
    }
    
    loading = true;
    error = null;
    
    try {
      const { data, error: insertError } = await supabase
        .from('dj_availability')
        .insert({
          user_id: user.id,
          start_date: newAvailability.start_date,
          end_date: newAvailability.end_date,
          status: newAvailability.status
        })
        .select();
      
      if (insertError) throw insertError;
      
      newAvailability = {
        start_date: '',
        end_date: '',
        status: 'available'
      };
      
      await loadAvailabilities();
    } catch (err) {
      console.error('Fehler beim Hinzufügen der Verfügbarkeit:', err);
      error = 'Verfügbarkeit konnte nicht hinzugefügt werden.';
    } finally {
      loading = false;
    }
  }
  
  async function deleteAvailability(id: string) {
    if (!confirm('Möchtest du diese Verfügbarkeit wirklich löschen?')) return;
    
    loading = true;
    error = null;
    
    try {
      const { error: deleteError } = await supabase
        .from('dj_availability')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      await loadAvailabilities();
    } catch (err) {
      console.error('Fehler beim Löschen der Verfügbarkeit:', err);
      error = 'Verfügbarkeit konnte nicht gelöscht werden.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (canAccess) {
      loadAvailabilities();
      loadProfileData();
    }
  });
  
  function getStatusInfo(status: 'available' | 'tentative' | 'requested' | 'booked') {
    const option = statusOptions.find(opt => opt.value === status);
    return option || { label: status, color: 'bg-gray-500' };
  }
</script>

<!-- Der Rest des Templates bleibt unverändert -->
<div class="space-y-8">
  {#if canAccess}
    <!-- Einführungstext -->
    <div class="prose prose-invert max-w-none">
      <h3>DJ Urlaub Kalender</h3>
      <p class="text-gray-400">
        Hier kannst du deine Profildaten und Verfügbarkeiten als DJ verwalten. Diese Informationen helfen uns bei der Planung von Events und Workshops.
      </p>
    </div>
    
    <!-- Formular für neue Verfügbarkeit -->
    <!-- Profildaten -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60 space-y-6">
      <h4 class="text-lg font-medium text-white">Profildaten</h4>
      
      <!-- Basis Kontaktdaten -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">E-Mail</label>
          <input
            type="email"
            bind:value={profileData.email}
            disabled
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-400"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Telefon</label>
          <input
            type="tel"
            bind:value={profileData.phone}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-400 mb-1">Website</label>
          <input
            type="url"
            bind:value={profileData.website}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Reisegruppe -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Reisegruppe (Anzahl)</label>
          <input
            type="number"
            bind:value={profileData.travel_group_size}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Alter der Reisegruppe</label>
          <input
            type="text"
            bind:value={profileData.travel_group_ages}
            placeholder="z.B. 25-30"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Besuchte Clubs -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">Besuchte Clubs</label>
        <div class="flex flex-wrap gap-2">
          {#each profileData.visited_clubs as club}
            <span class="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-800 text-white">
              {club}
              <button
                class="ml-1 text-gray-400 hover:text-red-400"
                on:click={() => {
                  profileData.visited_clubs = profileData.visited_clubs.filter(c => c !== club);
                }}
              >
                ×
              </button>
            </span>
          {/each}
          <input
            type="text"
            placeholder="Neuen Club hinzufügen"
            class="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            on:keydown={(event) => {
              if (event.key === 'Enter' && event.currentTarget instanceof HTMLInputElement) {
                const value = event.currentTarget.value.trim();
                if (value && !profileData.visited_clubs.includes(value)) {
                  profileData.visited_clubs = [...profileData.visited_clubs, value];
                  event.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </div>

      <!-- Biografie -->
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">Biografie</label>
        <textarea
          bind:value={profileData.biography}
          rows="4"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        ></textarea>
      </div>

      <!-- Social Media Links -->
      <div class="space-y-4">
        <h5 class="text-sm font-medium text-gray-400">Social Media Links</h5>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
            <input
              type="url"
              bind:value={profileData.social_links.instagram}
              placeholder="https://instagram.com/..."
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Facebook</label>
            <input
              type="url"
              bind:value={profileData.social_links.facebook}
              placeholder="https://facebook.com/..."
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">SoundCloud</label>
            <input
              type="url"
              bind:value={profileData.social_links.soundcloud}
              placeholder="https://soundcloud.com/..."
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Speichern Button -->
      <div class="pt-2">
        <button
          on:click={saveProfileData}
          disabled={loading_profile}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-indigo-500 hover:bg-indigo-400 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loading_profile}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wird gespeichert...
          {:else}
            Profildaten speichern
          {/if}
        </button>
      </div>
    </div>

    <!-- Video-Mix -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60 space-y-6">
      <h4 class="text-lg font-medium text-white">Video-Mix</h4>
      <div class="space-y-6">
        <VideoMixUploader dj={user} />
        <div class="border-t border-gray-800 pt-6">
          <VideoMixLink dj={user} />
        </div>
      </div>
    </div>

    <!-- Verfügbarkeiten Formular -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60 space-y-4">
      <h4 class="text-lg font-medium text-white">Neue Verfügbarkeit hinzufügen</h4>
      
      {#if error}
        <div class="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      {/if}
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-400 mb-1">Startdatum</label>
          <input
            type="date"
            id="start_date"
            bind:value={newAvailability.start_date}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-400 mb-1">Enddatum</label>
          <input
            type="date"
            id="end_date"
            bind:value={newAvailability.end_date}
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label for="status" class="block text-sm font-medium text-gray-400 mb-1">Status</label>
        <select
          id="status"
          bind:value={newAvailability.status}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div class="pt-2">
        <button
          on:click={addAvailability}
          disabled={loading}
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wird gespeichert...
          {:else}
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Hinzufügen
          {/if}
        </button>
      </div>
    </div>
    
    <!-- Liste der Verfügbarkeiten -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
      <h4 class="text-lg font-medium text-white mb-4">Deine Verfügbarkeiten</h4>
      
      {#if loading && availabilities.length === 0}
        <div class="text-center py-8">
          <svg class="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-gray-400">Verfügbarkeiten werden geladen...</p>
        </div>
      {:else if availabilities.length === 0}
        <div class="text-center py-8 text-gray-400">
          <p>Keine Verfügbarkeiten eingetragen.</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each availabilities as availability}
            <div class="bg-gray-800/70 rounded-lg p-4 border border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="inline-block w-3 h-3 rounded-full {getStatusInfo(availability.status).color}"></span>
                  <span class="font-medium text-white">{getStatusInfo(availability.status).label}</span>
                </div>
                <div class="text-gray-400 mt-1">
                  {formatDate(availability.start_date)} - {formatDate(availability.end_date)}
                </div>
              </div>
              
              <button
                on:click={() => deleteAvailability(availability.id)}
                class="text-red-400 hover:text-red-300 transition-colors"
                title="Löschen"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Legende -->
    <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
      <h4 class="text-lg font-medium text-white mb-4">Legende</h4>
      <div class="space-y-2">
        {#each statusOptions as option}
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 rounded-full {option.color}"></span>
            <span class="text-gray-300">{option.label}</span>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="p-6 bg-gray-900/80 rounded-xl border border-gray-800/60 text-center">
      <p class="text-gray-400">
        Du benötigst das DJ Urlaub Badge um auf diesen Bereich zugreifen zu können.
      </p>
    </div>
  {/if}
</div>