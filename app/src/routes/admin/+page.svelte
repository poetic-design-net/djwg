<script lang="ts">
  import type { Profile } from '$lib/types/profile';

  export let data: { users: Profile[] };

  let searchTerm = '';
  $: filteredUsers = data.users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>
  
  <div class="mb-6">
    <input
      type="text"
      bind:value={searchTerm}
      placeholder="Benutzer suchen..."
      class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="overflow-x-auto bg-white rounded-lg shadow">
    <table class="min-w-full table-auto">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öffentlich</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredUsers as user}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                {#if user.avatar_url}
                  <img src={user.avatar_url} alt="" class="h-8 w-8 rounded-full mr-3" />
                {:else}
                  <div class="h-8 w-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                    <span class="text-gray-500 text-sm">
                      {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                {/if}
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {user.full_name || 'Kein Name'}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.email || 'Keine Email'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.username || 'Kein Username'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Aktiv
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.is_public ? 'Ja' : 'Nein'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="mt-4 text-sm text-gray-500">
    Insgesamt {data.users.length} Benutzer
  </div>
</div>