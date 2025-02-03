<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let data: {
    users: Profile[];
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
</script>

<div class="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl font-medium text-white mb-2">Admin Dashboard</h1>
      <p class="text-gray-400">Verwalte Benutzer und Systemeinstellungen</p>
    </div>

    <!-- Benutzerliste -->
    <div class="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
      <div class="px-8 py-6 border-b border-gray-800">
        <h2 class="text-2xl font-medium text-white">
          Benutzer ({data.users.length})
        </h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left bg-gray-800/50">
              <th class="px-8 py-4 text-sm font-medium text-gray-400">Name</th>
              <th class="px-8 py-4 text-sm font-medium text-gray-400">E-Mail</th>
              <th class="px-8 py-4 text-sm font-medium text-gray-400">Registriert</th>
              <th class="px-8 py-4 text-sm font-medium text-gray-400">Zuletzt aktiv</th>
            </tr>
          </thead>
          <tbody>
            {#each data.users as user}
              <tr class="border-t border-gray-800 hover:bg-gray-800/30">
                <td class="px-8 py-4">
                  <div class="flex items-center">
                    {#if user.avatar_url}
                      <img
                        src={user.avatar_url}
                        alt=""
                        class="w-8 h-8 rounded-full mr-3 bg-gray-800"
                      />
                    {:else}
                      <div class="w-8 h-8 rounded-full mr-3 bg-gray-800 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-400">
                          {(user.first_name?.[0] || '') + (user.last_name?.[0] || '')}
                        </span>
                      </div>
                    {/if}
                    <div>
                      <div class="text-white">
                        {user.first_name} {user.last_name}
                      </div>
                      {#if user.username}
                        <div class="text-sm text-gray-400">@{user.username}</div>
                      {/if}
                    </div>
                  </div>
                </td>
                <td class="px-8 py-4 text-gray-300">{user.email || '-'}</td>
                <td class="px-8 py-4 text-gray-300">{formatDate(user.created_at)}</td>
                <td class="px-8 py-4 text-gray-300">
                  {formatDate(user.last_seen)}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="px-8 py-4 text-center text-gray-400">
                  Keine Benutzer gefunden
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>