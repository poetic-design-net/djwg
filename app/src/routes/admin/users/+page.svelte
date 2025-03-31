<script lang="ts">
    import { toasts } from '$lib/stores/toast';
    import type { EnrichedProfile } from '$lib/types/profile';
    import type { Badge, UserBadge } from '$lib/types/badge';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
  
    export let data: { 
      users: EnrichedProfile[],
      badges: Badge[],
      userBadges: UserBadge[]
    };
  
    let searchTerm = '';
    let selectedBadgeFilter: string | null = null;
    let bulkActionType: 'add' | 'remove' = 'add';
    let selectedUserIds: string[] = [];
    let selectedBulkBadge: Badge | null = null;

    function exportEmails() {
      // Erstelle CSV-Inhalt mit Header
      const csvContent = ['Email,Name,Username'].concat(
        filteredUsers
          .filter(user => user.email)
          .map(user => [
            user.email,
            user.full_name || '',
            user.username || ''
          ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','))
      ).join('\n');

      // Erstelle Blob und Download-Link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `benutzer-emails-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    let selectedBadges: Record<string, Badge | null> = {};
    let sortField: keyof EnrichedProfile | 'badges' = 'email'; // Erweitert um 'badges'
    let sortDirection: 'asc' | 'desc' = 'asc';
    
    $: userBadgeCounts = data.users.reduce((acc, user) => {
      acc[user.id] = getUserBadges(user.id).length;
      return acc;
    }, {} as Record<string, number>);

    $: filteredUsers = data.users
      .filter(user => 
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.username?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        // Filtere nach ausgewähltem Badge
        (!selectedBadgeFilter || getUserBadges(user.id).some(badge => 
          badge.id === selectedBadgeFilter
        ))
      )
      .sort((a, b) => {
      // Sortierlogik bleibt unverändert
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'badges') {
        const countA = userBadgeCounts[a.id] || 0;
        const countB = userBadgeCounts[b.id] || 0;
        return (countA - countB) * modifier;
      } else {
        const aVal = (a[sortField as keyof EnrichedProfile] ?? '') as string | number | null | undefined;
        const bVal = (b[sortField as keyof EnrichedProfile] ?? '') as string | number | null | undefined;

        // Handle null or undefined values by treating them as empty strings or zero
        const valA = aVal === null || aVal === undefined ? '' : aVal;
        const valB = bVal === null || bVal === undefined ? '' : bVal;

        // Ensure consistent comparison, convert numbers to strings if needed for localeCompare
        const strA = typeof valA === 'number' ? valA.toString() : valA;
        const strB = typeof valB === 'number' ? valB.toString() : valB;

        // Perform comparison
        if (typeof strA === 'string' && typeof strB === 'string') {
          return strA.localeCompare(strB) * modifier;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * modifier;
        } else {
          // Fallback for mixed types or other scenarios
          return String(valA).localeCompare(String(valB)) * modifier;
        }
      }
    });



    function toggleSort(field: keyof EnrichedProfile | 'badges') {
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDirection = 'asc';
      }
    }

    function formatDate(dateStr: string | undefined | null): string {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

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

    const handleBulkRemoval = () => {
      return async ({ result }: { result: { type: string; data?: any } }) => {
        try {
          if (result.type === 'success') {
            await invalidateAll();
            selectedUserIds = [];
            selectedBulkBadge = null;
            toasts.success('Badges erfolgreich entfernt');
          } else {
            console.error('Fehler beim Entfernen der Badges:', result);
            toasts.error(result.data?.message || 'Fehler beim Entfernen der Badges');
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

    const handleBulkAssignment = () => {
      return async ({ result }: { result: { type: string; data?: any } }) => {
        try {
          if (result.type === 'success') {
            await invalidateAll();
            selectedUserIds = [];
            selectedBulkBadge = null;
            toasts.success('Badges erfolgreich zugewiesen');
          } else {
            console.error('Fehler beim Zuweisen der Badges:', result);
            toasts.error(result.data?.message || 'Fehler beim Zuweisen der Badges');
          }
        } catch (error) {
          console.error('Unerwarteter Fehler:', error);
          toasts.error('Ein unerwarteter Fehler ist aufgetreten');
        }
      };
    };

    function toggleAllUsers() {
      if (selectedUserIds.length === filteredUsers.length) {
        selectedUserIds = [];
      } else {
        selectedUserIds = filteredUsers.map(user => user.id);
      }
    }

    function toggleUserSelection(userId: string) {
      const index = selectedUserIds.indexOf(userId);
      if (index === -1) {
        selectedUserIds = [...selectedUserIds, userId];
      } else {
        selectedUserIds = selectedUserIds.filter(id => id !== userId);
      }
    }
</script>
  
<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Benutzer & Badges Verwaltung</h1>
  <div class="mb-6">
    <div class="flex gap-4">
      <input
        type="text"
        bind:value={searchTerm}
        placeholder="Benutzer suchen..."
        class="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        bind:value={selectedBadgeFilter}
        class="px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={null}>Alle Badges</option>
        {#each data.badges as badge}
          <option value={badge.id}>{badge.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="my-4 text font-medium text-gray-200">
    {filteredUsers.length} von {data.users.length} Benutzern
    {selectedBadgeFilter ? `(gefiltert nach Badge)` : ''}
  </div>

  {#if selectedUserIds.length > 0}
    <div class="mb-4 p-4 bg-gray-800 rounded-lg shadow flex flex-wrap items-center gap-4">
      <span class="text-gray-200">
        {selectedUserIds.length} Benutzer ausgewählt
      </span>
      <div class="flex items-center gap-2">
        <select
          bind:value={bulkActionType}
          class="rounded-lg border-gray-700 p-1 bg-gray-800 text-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500/20 focus:ring-opacity-50 py-2 text-sm"
        >
          <option value="add">Badge hinzufügen</option>
          <option value="remove">Badge entfernen</option>
        </select>

        <select
          bind:value={selectedBulkBadge}
          class="rounded-lg border-gray-700 p-1 bg-gray-800 text-gray-200 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500/20 focus:ring-opacity-50 py-2 text-sm"
        >
          <option value={null}>Badge auswählen</option>
          {#each data.badges as badge}
            <option value={badge} title={badge.description || ''}>
              {badge.name} {#if bulkActionType === 'add'}(Hinzufügen){:else}(Entfernen){/if}
            </option>
          {/each}
        </select>
        {#if selectedBulkBadge}
          {#if bulkActionType === 'add'}
            <form action="?/assignBulkBadges" method="POST" use:enhance={handleBulkAssignment}>
              <input type="hidden" name="userIds" value={JSON.stringify(selectedUserIds)}>
              <input type="hidden" name="badgeId" value={selectedBulkBadge.id}>
              <button 
                type="submit" 
                class="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              >
                Badges zuweisen
              </button>
            </form>
          {:else}
            <form action="?/removeBulkBadges" method="POST" use:enhance={handleBulkRemoval}>
              <input type="hidden" name="userIds" value={JSON.stringify(selectedUserIds)}>
              <input type="hidden" name="badgeId" value={selectedBulkBadge.id}>
              <button 
                type="submit" 
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Badges entfernen
              </button>
            </form>
          {/if}
        {/if}
        <button class="text-red-400 hover:text-red-300" on:click={() => selectedUserIds = []}>Auswahl aufheben</button>
      </div>
    </div>
  {/if}

  <div class="my-4 text font-medium text-gray-200">
    Insgesamt {data.users.length} Benutzer
    <button 
      on:click={exportEmails}
      class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
    >
      Emails exportieren (CSV)
    </button>
  </div>

  <div class="overflow-x-auto bg-white rounded-lg shadow">
    <table class="min-w-full table-auto">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="flex items-center">
              <input
                type="checkbox"
                checked={selectedUserIds.length === filteredUsers.length}
                on:change={toggleAllUsers}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
            </div>
          </th>

          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => toggleSort('full_name')}>
            <div class="flex items-center group">
              <span>Name</span>
              <span class="ml-1 opacity-0 group-hover:opacity-50 {sortField === 'full_name' ? 'opacity-100' : ''}">
                {#if sortField === 'full_name'}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d={sortDirection === 'asc' 
                      ? "M3.293 12.293a1 1 0 011.414 0L10 17.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                      : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                {/if}
              </span>
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => toggleSort('email')}>
            <div class="flex items-center group">
              <span>Email</span>
              <span class="ml-1 opacity-0 group-hover:opacity-50 {sortField === 'email' ? 'opacity-100' : ''}">
                {#if sortField === 'email'}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d={sortDirection === 'asc' 
                      ? "M3.293 12.293a1 1 0 011.414 0L10 17.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                      : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                {/if}
              </span>
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => toggleSort('username')}>
            <div class="flex items-center group">
              <span>Username</span>
              <span class="ml-1 opacity-0 group-hover:opacity-50 {sortField === 'username' ? 'opacity-100' : ''}">
                {#if sortField === 'username'}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d={sortDirection === 'asc' 
                      ? "M3.293 12.293a1 1 0 011.414 0L10 17.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                      : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                {/if}
              </span>
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => toggleSort('auth_created_at')}>
            <div class="flex items-center justify-between group">
              <span>Benutzerinfo</span>
              <span class="ml-1 opacity-0 group-hover:opacity-50 {sortField === 'auth_created_at' ? 'opacity-100' : ''}">
                {#if sortField === 'auth_created_at'}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d={sortDirection === 'asc' 
                      ? "M3.293 12.293a1 1 0 011.414 0L10 17.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                      : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                {/if}
              </span>
            </div>
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => toggleSort('badges')}>
            <div class="flex items-center group">
              <span>Badges</span>
              <span class="ml-1 opacity-0 group-hover:opacity-50 {sortField === 'badges' ? 'opacity-100' : ''}">
                {#if sortField === 'badges'}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d={sortDirection === 'asc' 
                      ? "M3.293 12.293a1 1 0 011.414 0L10 17.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
                      : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                {/if}
              </span>
            </div>
          </th>
          
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge Verwalten</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each filteredUsers as user}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(user.id)}
                  on:change={() => toggleUserSelection(user.id)}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </div>
            </td>

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
            <td class="px-6 py-4 text-sm text-gray-500">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">Registriert:</span>   {formatDate(user.auth_created_at)}
                </div>
                <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400">Letzter Login:</span>   {formatDate(user.auth_last_sign_in_at)}
              </div>
            </div>
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
              <div class="flex flex-col space-y-2">
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