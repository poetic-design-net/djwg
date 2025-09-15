<script lang="ts">
  import { onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';

  interface WeeztixOrder {
    id: string;
    order_guid: string;
    user_id: string | null;
    user_email: string | null;
    customer_firstname: string | null;
    customer_lastname: string | null;
    badge_assigned: boolean;
    badge_assigned_at: string | null;
    claim_code: string | null;
    created_at: string;
    purchase_date: string | null;
    status: 'completed' | 'pending_badge' | 'unclaimed' | 'no_user';
    profiles?: {
      id: string;
      email: string;
      full_name: string | null;
      username: string | null;
    };
  }

  interface OrderStats {
    total: number;
    claimed: number;
    unclaimed: number;
    badges_assigned: number;
    pending_badges: number;
  }

  let orders: WeeztixOrder[] = [];
  let stats: OrderStats | null = null;
  let loading = false;
  let checkEmail = '';
  let isExpanded = false;
  let activeTab: 'overview' | 'check' | 'unclaimed' | 'bulk' = 'overview';

  onMount(() => {
    loadOrders();
  });

  async function loadOrders() {
    loading = true;
    try {
      const response = await fetch('/api/weeztix/admin/orders');
      if (response.ok) {
        const data = await response.json();
        orders = data.orders;
        stats = data.stats;
      } else {
        toasts.error('Fehler beim Laden der Weeztix-Bestellungen');
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toasts.error('Fehler beim Laden der Bestellungen');
    } finally {
      loading = false;
    }
  }

  async function checkUser() {
    if (!checkEmail) {
      toasts.error('Bitte Email-Adresse eingeben');
      return;
    }

    loading = true;
    try {
      const response = await fetch('/api/weeztix/admin/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: checkEmail,
          autoAssignBadge: true
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.orders.length > 0) {
          toasts.success(
            `${result.orders.length} Bestellung(en) für ${checkEmail} gefunden. ` +
            (result.badgeAssigned ? 'Badge wurde zugewiesen!' : '')
          );
        } else {
          toasts.info(`Keine Bestellungen für ${checkEmail} gefunden`);
        }

        // Reload orders to show updated status
        await loadOrders();
        checkEmail = '';
      } else {
        toasts.error(result.message || 'Fehler beim Prüfen des Benutzers');
      }
    } catch (err) {
      console.error('Error checking user:', err);
      toasts.error('Fehler beim Prüfen des Benutzers');
    } finally {
      loading = false;
    }
  }

  async function bulkAssignBadges() {
    if (!confirm('Möchten Sie wirklich allen Benutzern mit Weeztix-Bestellungen Badges zuweisen?')) {
      return;
    }

    loading = true;
    try {
      const response = await fetch('/api/weeztix/admin/assign-badges', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        toasts.success(
          `Badge-Zuweisung abgeschlossen: ${result.assigned} zugewiesen, ` +
          `${result.skipped} übersprungen, ${result.errors} Fehler`
        );

        // Reload orders to show updated status
        await loadOrders();
      } else {
        toasts.error(result.message || 'Fehler bei der Badge-Zuweisung');
      }
    } catch (err) {
      console.error('Error assigning badges:', err);
      toasts.error('Fehler bei der Badge-Zuweisung');
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending_badge': return 'bg-yellow-100 text-yellow-800';
      case 'unclaimed': return 'bg-orange-100 text-orange-800';
      case 'no_user': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Badge zugewiesen';
      case 'pending_badge': return 'Badge ausstehend';
      case 'unclaimed': return 'Nicht abgeholt';
      case 'no_user': return 'Kein Benutzer';
      default: return status;
    }
  }

  $: unclaimedOrders = orders.filter(o => o.status === 'unclaimed');
  $: pendingBadgeOrders = orders.filter(o => o.status === 'pending_badge');
</script>

<div class="bg-white rounded-lg shadow-md p-4">
  <!-- Header with toggle -->
  <div class="flex items-center justify-between mb-4 cursor-pointer" on:click={() => isExpanded = !isExpanded}>
    <h3 class="text-lg font-semibold flex items-center gap-2">
      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
      Weeztix Badge-Verwaltung
      {#if stats}
        <span class="text-sm font-normal text-gray-600">
          ({stats.total} Bestellungen)
        </span>
      {/if}
    </h3>
    <button class="text-gray-500 hover:text-gray-700">
      <svg class="w-5 h-5 transition-transform {isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>

  {#if isExpanded}
    <!-- Statistics Overview -->
    {#if stats}
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <div class="bg-gray-50 rounded p-2">
          <div class="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div class="text-xs text-gray-600">Gesamt</div>
        </div>
        <div class="bg-green-50 rounded p-2">
          <div class="text-2xl font-bold text-green-600">{stats.badges_assigned}</div>
          <div class="text-xs text-gray-600">Badges zugewiesen</div>
        </div>
        <div class="bg-yellow-50 rounded p-2">
          <div class="text-2xl font-bold text-yellow-600">{stats.pending_badges}</div>
          <div class="text-xs text-gray-600">Ausstehend</div>
        </div>
        <div class="bg-orange-50 rounded p-2">
          <div class="text-2xl font-bold text-orange-600">{stats.unclaimed}</div>
          <div class="text-xs text-gray-600">Nicht abgeholt</div>
        </div>
        <div class="bg-blue-50 rounded p-2">
          <div class="text-2xl font-bold text-blue-600">{stats.claimed}</div>
          <div class="text-xs text-gray-600">Zugeordnet</div>
        </div>
      </div>
    {/if}

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-4">
      <nav class="-mb-px flex space-x-4">
        <button
          on:click={() => activeTab = 'overview'}
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'overview' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Übersicht
        </button>
        <button
          on:click={() => activeTab = 'check'}
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'check' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Benutzer prüfen
          {#if pendingBadgeOrders.length > 0}
            <span class="ml-1 bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 text-xs">{pendingBadgeOrders.length}</span>
          {/if}
        </button>
        <button
          on:click={() => activeTab = 'unclaimed'}
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'unclaimed' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Nicht abgeholt
          {#if unclaimedOrders.length > 0}
            <span class="ml-1 bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs">{unclaimedOrders.length}</span>
          {/if}
        </button>
        <button
          on:click={() => activeTab = 'bulk'}
          class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'bulk' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        >
          Bulk-Aktionen
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[200px]">
      {#if loading}
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      {:else if activeTab === 'overview'}
        <!-- Overview Tab -->
        <div class="space-y-2">
          <h4 class="font-medium text-gray-700 mb-2">Letzte Bestellungen</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-1 px-2">Datum</th>
                  <th class="text-left py-1 px-2">Email</th>
                  <th class="text-left py-1 px-2">Name</th>
                  <th class="text-left py-1 px-2">Status</th>
                  <th class="text-left py-1 px-2">Claim Code</th>
                </tr>
              </thead>
              <tbody>
                {#each orders.slice(0, 5) as order}
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-1 px-2 text-xs">{formatDate(order.purchase_date || order.created_at)}</td>
                    <td class="py-1 px-2 text-xs">
                      {order.user_email || order.profiles?.email || '-'}
                    </td>
                    <td class="py-1 px-2 text-xs">
                      {order.customer_firstname || ''} {order.customer_lastname || ''}
                    </td>
                    <td class="py-1 px-2">
                      <span class="inline-flex px-2 py-0.5 text-xs rounded-full {getStatusColor(order.status)}">
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td class="py-1 px-2 text-xs font-mono">
                      {order.claim_code || '-'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if orders.length > 5}
            <p class="text-xs text-gray-500 mt-2">
              Zeige 5 von {orders.length} Bestellungen
            </p>
          {/if}
        </div>

      {:else if activeTab === 'check'}
        <!-- Check User Tab -->
        <div class="space-y-4">
          <div class="flex gap-2">
            <input
              type="email"
              bind:value={checkEmail}
              placeholder="Email-Adresse eingeben"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              on:keydown={(e) => e.key === 'Enter' && checkUser()}
            />
            <button
              on:click={checkUser}
              disabled={!checkEmail || loading}
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Prüfen & Badge zuweisen
            </button>
          </div>

          {#if pendingBadgeOrders.length > 0}
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 class="font-medium text-yellow-800 mb-2">
                Benutzer mit ausstehenden Badges ({pendingBadgeOrders.length})
              </h5>
              <div class="space-y-1">
                {#each pendingBadgeOrders.slice(0, 5) as order}
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-700">
                      {order.user_email || order.profiles?.email}
                    </span>
                    <button
                      on:click={() => {checkEmail = order.user_email || order.profiles?.email || ''; checkUser();}}
                      class="text-purple-600 hover:text-purple-800 text-xs"
                    >
                      Badge zuweisen →
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

      {:else if activeTab === 'unclaimed'}
        <!-- Unclaimed Orders Tab -->
        <div class="space-y-4">
          {#if unclaimedOrders.length === 0}
            <p class="text-gray-500">Keine nicht abgeholten Bestellungen</p>
          {:else}
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h5 class="font-medium text-orange-800 mb-2">
                Nicht abgeholte Bestellungen ({unclaimedOrders.length})
              </h5>
              <p class="text-xs text-gray-600 mb-3">
                Diese Bestellungen haben einen Claim-Code, aber der Benutzer hat sich noch nicht registriert.
              </p>
              <div class="space-y-2">
                {#each unclaimedOrders as order}
                  <div class="bg-white rounded border border-orange-200 p-2">
                    <div class="flex justify-between items-start">
                      <div class="text-sm">
                        <div class="font-medium">{order.user_email}</div>
                        <div class="text-xs text-gray-600">
                          {order.customer_firstname} {order.customer_lastname}
                        </div>
                        <div class="text-xs text-gray-500">
                          Bestellt: {formatDate(order.purchase_date || order.created_at)}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-mono text-sm text-orange-600">
                          {order.claim_code}
                        </div>
                        <button
                          class="text-xs text-blue-600 hover:text-blue-800 mt-1"
                          on:click={() => {
                            navigator.clipboard.writeText(order.claim_code || '');
                            toasts.success('Claim-Code kopiert');
                          }}
                        >
                          Code kopieren
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

      {:else if activeTab === 'bulk'}
        <!-- Bulk Actions Tab -->
        <div class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 class="font-medium text-blue-800 mb-2">Bulk Badge-Zuweisung</h5>
            <p class="text-sm text-gray-600 mb-3">
              Weist allen Benutzern mit Weeztix-Bestellungen automatisch Badges zu.
            </p>
            {#if stats && stats.pending_badges > 0}
              <p class="text-sm font-medium text-blue-700 mb-3">
                {stats.pending_badges} Benutzer warten auf Badge-Zuweisung
              </p>
            {/if}
            <button
              on:click={bulkAssignBadges}
              disabled={loading || !stats || stats.pending_badges === 0}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Alle Badges zuweisen
            </button>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">Weitere Aktionen</h5>
            <div class="space-y-2">
              <button
                on:click={loadOrders}
                class="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                🔄 Daten aktualisieren
              </button>
              <button
                on:click={() => window.open('/admin/weeztix', '_blank')}
                class="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                ⚙️ Weeztix-Einstellungen öffnen
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>