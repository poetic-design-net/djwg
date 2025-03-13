<script lang="ts">
    import { toasts } from '$lib/stores/toast';
    import type { Profile } from '$lib/types/profile';
    import type { Badge, UserBadge } from '$lib/types/badge';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { ActionResult } from '@sveltejs/kit';
  
    export let data: { 
      users: Profile[],
      badges: Badge[],
      userBadges: UserBadge[]
    };
  
    let searchTerm = '';
    let selectedBadges: Record<string, Badge | null> = {};
    
    $: filteredUsers = data.users.filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function getUserBadges(userId: string): Badge[] {
      const userBadgeIds = data.userBadges
        .filter(ub => ub.user_id === userId)
        .map(ub => ub.badge_id);
      
      return data.badges.filter(badge => userBadgeIds.includes(badge.id));
    }

    function hasBadge(userId: string, badgeId: string): boolean {
      return data.userBadges.some(ub => 
        ub.user_id === userId && ub.badge_id === badgeId
      );
    }

    function truncateText(text: string | null | undefined, maxLength: number = 20): string {
      if (!text) return '?';
      return text.length > maxLength 
        ? text.substring(0, maxLength) + '...'
        : text;
    }

    const handleBadgeRemoval = () => {
      return async ({ result }: { result: { type: string; data?: any } }) => {
        try {
          if (result.type === 'success') {
            await invalidateAll();
            toasts.success('Badge erfolgreich entfernt');
          } else {
            console.error('Fehler beim Entfernen des Badges:', result);
            toasts.error(result.data?.message || 'Fehler beim Entfernen des Badges');
          }
        } catch (error) {
          console.error('Unerwarteter Fehler:', error);
          toasts.error('Ein unerwarteter Fehler ist aufgetreten');
        }
      };
    };

    const handleBadgeAssignment = (userId: string) => {
      return async ({ result }: { result: { type: string; data?: any } }) => {
        try {
          if (result.type === 'success') {
            await invalidateAll();
            selectedBadges[userId] = null;
            toasts.success('Badge erfolgreich zugewiesen');
          } else {
            console.error('Fehler beim Zuweisen des Badges:', result);
            toasts.error(result.data?.message || 'Fehler beim Zuweisen des Badges');
          }
        } catch (error) {
          console.error('Unerwarteter Fehler:', error);
          toasts.error('Ein unerwarteter Fehler ist aufgetreten');
        }
      };
    };
</script>
  
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Benutzer & Badges Verwaltung</h1>
  
  <div class="mb-6">
    <input
      type="text"
      bind:value={searchTerm}
      placeholder="Benutzer suchen..."
      class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="my-4 text font-medium text-gray-200">
    Insgesamt {data.users.length} Benutzer
  </div>

  <div class="overflow-x-auto bg-white rounded-lg shadow">
    <table class="min-w-full table-auto">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge Verwalten</th>
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
                  <div class="text-sm font-medium text-gray-900 relative group">
                    <span class="truncate max-w-[150px] inline-block">
                      {truncateText(user.full_name, 15) || 'Kein Name'}
                    </span>
                    <div class="absolute left-0 bottom-full mb-1 hidden group-hover:block z-20">
                      <div class="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                        {user.full_name || 'Kein Name'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative group">
              <span class="truncate max-w-[200px] inline-block" title={user.email || 'Keine Email'}>
                {truncateText(user.email, 25) || 'Keine Email'}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span title={user.username || 'Kein Username'}>
                {truncateText(user.username, 15) || 'Kein Username'}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-2">
                {#each getUserBadges(user.id) as badge}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <span class="truncate max-w-[100px]" title={badge.name}>{badge.name}</span>
                    <form 
                      action="?/removeBadge" 
                      method="POST" 
                      use:enhance={handleBadgeRemoval}
                      class="ml-1"
                    >
                      <input type="hidden" name="userId" value={user.id}>
                      <input type="hidden" name="badgeId" value={badge.id}>
                      <button 
                        type="submit" 
                        class="text-blue-600 hover:text-blue-800 focus:outline-none p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                        title="Badge entfernen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </span>
                {/each}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center space-x-2">
                <select
                  bind:value={selectedBadges[user.id]}
                  class="rounded-lg border-gray-700 p-1 bg-gray-800 text-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500/20 focus:ring-opacity-50 py-2 text-sm"
                >
                  <option value={null} class="text-sm">Badge auswählen</option>
                  {#each data.badges as badge}
                    {#if !hasBadge(user.id, badge.id)}
                      <option value={badge} title={badge.description || ''}>
                        {truncateText(badge.name)}
                      </option>
                    {/if}
                  {/each}
                </select>
                {#if selectedBadges[user.id]}
                  <form 
                    action="?/assignBadge" 
                    method="POST" 
                    use:enhance={() => handleBadgeAssignment(user.id)}
                  >
                    <input type="hidden" name="userId" value={user.id}>
                    <input type="hidden" name="badgeId" value={selectedBadges[user.id]?.id}>
                    <button
                      type="submit"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-black bg-green-500 hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Zuweisen
                    </button>
                  </form>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>