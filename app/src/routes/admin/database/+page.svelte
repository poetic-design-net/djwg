<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  // Badge editing state
  let editingBadge: any = null;
  let creatingBadge = false;
  let editForm = {
    name: '',
    description: '',
    slug: ''
  };

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getUserDisplayName(profile: any): string {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.email || 'Unbekannt';
  }

  function getPlanName(planType: string): string {
    const planNames: Record<string, string> = {
      monthly: 'Monatlich',
      quarterly: 'Quartalsweise',
      yearly: 'Jährlich'
    };
    return planNames[planType] || planType;
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-red-100 text-red-800',
      incomplete: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Badge editing functions
  function startEditBadge(badge: any) {
    editingBadge = badge;
    editForm = {
      name: badge.name || '',
      description: badge.description || '',
      slug: badge.slug || ''
    };
  }

  function startCreateBadge() {
    creatingBadge = true;
    editForm = { name: '', description: '', slug: '' };
  }

  function cancelEdit() {
    editingBadge = null;
    creatingBadge = false;
    editForm = { name: '', description: '', slug: '' };
  }

  async function saveBadge() {
    if (!editingBadge) return;
    
    try {
      const response = await fetch('/api/admin/badges/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingBadge.id,
          ...editForm
        })
      });

      if (response.ok) {
        // Update local data
        const badgeIndex = data.badgeDistribution.findIndex(b => b.id === editingBadge.id);
        if (badgeIndex !== -1) {
          data.badgeDistribution[badgeIndex] = { ...data.badgeDistribution[badgeIndex], ...editForm };
        }
        cancelEdit();
      } else {
        alert('Fehler beim Speichern des Badges');
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Fehler beim Speichern des Badges');
    }
  }

  async function createBadge() {
    try {
      const response = await fetch('/api/admin/badges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        // Add new badge to local data
        if (data.badgeDistribution) {
          data.badgeDistribution = [...data.badgeDistribution, { ...result.badge, count: 0 }];
        } else {
          data.badgeDistribution = [{ ...result.badge, count: 0 }];
        }
        cancelEdit();
        alert('Badge erfolgreich erstellt!');
      } else {
        const error = await response.json();
        alert(error.error || 'Fehler beim Erstellen des Badges');
      }
    } catch (error) {
      console.error('Error creating badge:', error);
      alert('Fehler beim Erstellen des Badges');
    }
  }

  // Quick Actions
  async function refreshData() {
    window.location.reload();
  }
</script>

<svelte:head>
  <title>Database Management - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
        <p class="text-gray-600">Überwache Supabase-Datenbank und System-Performance</p>
      </div>
      <button 
        on:click={refreshData}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Aktualisieren
      </button>
    </div>

    <!-- Database Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Benutzer</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.totalUsers}</p>
          </div>
        </div>
      </div>

      <!-- Total Badges -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Badge-Zuweisungen</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.totalBadges}</p>
          </div>
        </div>
      </div>

      <!-- Total Subscriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Subscriptions</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.totalSubscriptions}</p>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Neue (7 Tage)</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.recentUsers}</p>
          </div>
        </div>
      </div>

      <!-- Active Subscriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-emerald-100 rounded-lg">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Aktive Abos</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.activeSubscriptions}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Badge Distribution -->
    <div class="mb-8">
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-medium text-gray-900">Badge-Verteilung</h2>
            <p class="text-sm text-gray-600">Übersicht über die am häufigsten vergebenen Badges</p>
          </div>
          <button
            on:click={startCreateBadge}
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Neues Badge
          </button>
        </div>
        <div class="p-6">
          {#if data.badgeDistribution && data.badgeDistribution.length > 0}
            <div class="space-y-4">
              {#each data.badgeDistribution.slice(0, 10) as badge}
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {badge.name}
                      </p>
                      <p class="text-xs text-gray-500 truncate">
                        {#if badge.description}
                          {badge.description}
                        {/if}
                      </p>
                      <p class="text-xs text-gray-400 font-mono truncate">
                        ID: {badge.id}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {badge.count}x
                    </span>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        style="width: {Math.min(100, (badge.count / Math.max(...data.badgeDistribution.map(b => b.count))) * 100)}%"
                      ></div>
                    </div>
                    <button
                      on:click={() => startEditBadge(badge)}
                      class="text-gray-400 hover:text-blue-600 p-1"
                      title="Badge bearbeiten"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-4">Keine Badge-Daten verfügbar</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Users -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Neueste Benutzer</h2>
        </div>
        <div class="p-6">
          {#if data.recentActivity.users.length > 0}
            <div class="space-y-4">
              {#each data.recentActivity.users as user}
                <div class="flex items-center space-x-3">
                  {#if user.avatar_url}
                    <img class="h-8 w-8 rounded-full" src={user.avatar_url} alt="" />
                  {:else}
                    <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {getUserDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {getUserDisplayName(user)}
                    </p>
                    <p class="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div class="text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-4">Keine neuen Benutzer</p>
          {/if}
        </div>
      </div>

      <!-- Recent Subscriptions -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Neueste Subscriptions</h2>
        </div>
        <div class="p-6">
          {#if data.recentActivity.subscriptions.length > 0}
            <div class="space-y-4">
              {#each data.recentActivity.subscriptions as subscription}
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(subscription.status)}">
                        {subscription.status}
                      </span>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName(subscription.profiles)}
                      </p>
                      <p class="text-sm text-gray-500">
                        {getPlanName(subscription.plan_type)}
                      </p>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500">
                    {formatDate(subscription.created_at)}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-4">Keine neuen Subscriptions</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Badge Edit Modal -->
{#if editingBadge}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Badge bearbeiten</h3>
        
        <form on:submit|preventDefault={saveBadge} class="space-y-4">
          <div>
            <label for="badge-name" class="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="badge-name"
              type="text"
              bind:value={editForm.name}
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label for="badge-description" class="block text-sm font-medium text-gray-700">Beschreibung</label>
            <textarea
              id="badge-description"
              bind:value={editForm.description}
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label for="badge-slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <input
              id="badge-slug"
              type="text"
              bind:value={editForm.slug}
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              on:click={cancelEdit}
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Badge Create Modal -->
{#if creatingBadge}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Neues Badge erstellen</h3>
        
        <form on:submit|preventDefault={createBadge} class="space-y-4">
          <div>
            <label for="create-badge-name" class="block text-sm font-medium text-gray-700">Name *</label>
            <input
              id="create-badge-name"
              type="text"
              bind:value={editForm.name}
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              required
              placeholder="Badge-Name eingeben"
            />
          </div>
          
          <div>
            <label for="create-badge-description" class="block text-sm font-medium text-gray-700">Beschreibung</label>
            <textarea
              id="create-badge-description"
              bind:value={editForm.description}
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="Beschreibung des Badges (optional)"
            ></textarea>
          </div>
          
          <div>
            <label for="create-badge-slug" class="block text-sm font-medium text-gray-700">Slug</label>
            <input
              id="create-badge-slug"
              type="text"
              bind:value={editForm.slug}
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="badge-slug (optional)"
            />
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              on:click={cancelEdit}
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
