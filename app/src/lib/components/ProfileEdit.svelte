<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  
  export let user: {
    email: string;
    user_metadata?: {
      firstname?: string;
      name?: string;
    };
  };

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;
  let firstname = user.user_metadata?.firstname || user.user_metadata?.name || '';
  let success = false;
  let error = '';

  const handleSubmit = async () => {
    loading = true;
    error = '';
    success = false;

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { firstname }
      });

      if (updateError) throw updateError;

      success = true;
      // Aktualisiere die user_metadata im Parent
      user.user_metadata = data.user.user_metadata;
    } catch (e: any) {
      error = e?.message || 'Ein Fehler ist aufgetreten';
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div>
    <label for="firstname" class="block text-sm font-medium text-gray-400 mb-2">
      Name
    </label>
    <input
      type="text"
      id="firstname"
      bind:value={firstname}
      class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
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