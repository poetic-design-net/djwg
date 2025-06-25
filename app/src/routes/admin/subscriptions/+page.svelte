<script lang="ts">
  import type { PageData } from './$types';
  import { formatSubscriptionStatus, getDaysUntilPeriodEnd } from '$lib/services/subscription';

  export let data: PageData;

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  function getPlanName(planType: string): string {
    const planNames: Record<string, string> = {
      monthly: '1 Monat',
      quarterly: '3 Monate',
      yearly: '12 Monate'
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

  function getUserDisplayName(profile: any): string {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.email || 'Unbekannt';
  }

  // Sortiere Subscriptions nach Status (aktive zuerst)
  $: sortedSubscriptions = data.subscriptions.sort((a, b) => {
    const statusOrder: Record<string, number> = { active: 0, trialing: 1, past_due: 2, canceled: 3, incomplete: 4 };
    return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
  });
</script>

<svelte:head>
  <title>Subscription Management - Admin Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">NextLevel DJs Subscriptions</h1>
      <p class="text-gray-600">Verwalte alle Abonnements und überwache die Performance</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Subscriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Gesamt</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.total}</p>
          </div>
        </div>
      </div>

      <!-- Active Subscriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Aktiv</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.active}</p>
          </div>
        </div>
      </div>

      <!-- Trialing Subscriptions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Testphase</p>
            <p class="text-2xl font-bold text-gray-900">{data.statistics.trialing}</p>
          </div>
        </div>
      </div>

      <!-- MRR -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">MRR</p>
            <p class="text-2xl font-bold text-gray-900">{formatCurrency(data.statistics.mrr)}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Distribution -->
    <div class="bg-white rounded-lg shadow mb-8">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Plan-Verteilung</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{data.statistics.planStats.monthly}</div>
            <div class="text-sm text-gray-600">Monatlich</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{data.statistics.planStats.quarterly}</div>
            <div class="text-sm text-gray-600">Quartalsweise</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{data.statistics.planStats.yearly}</div>
            <div class="text-sm text-gray-600">Jährlich</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscriptions Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Alle Subscriptions</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benutzer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktueller Zeitraum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verbleibend
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Erstellt
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each sortedSubscriptions as subscription}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {#if subscription.profiles.avatar_url}
                      <img class="h-8 w-8 rounded-full" src={subscription.profiles.avatar_url} alt="" />
                    {:else}
                      <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {getUserDisplayName(subscription.profiles).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">
                        {getUserDisplayName(subscription.profiles)}
                      </div>
                      <div class="text-sm text-gray-500">{subscription.profiles.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getPlanName(subscription.plan_type)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(subscription.status)}">
                    {formatSubscriptionStatus(subscription.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {#if subscription.current_period_start && subscription.current_period_end}
                    <div>
                      <div>{formatDate(subscription.current_period_start)}</div>
                      <div class="text-gray-500">bis {formatDate(subscription.current_period_end)}</div>
                    </div>
                  {:else}
                    <span class="text-gray-400">-</span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {#if subscription.current_period_end}
                    {getDaysUntilPeriodEnd(subscription.current_period_end)} Tage
                  {:else}
                    <span class="text-gray-400">-</span>
                  {/if}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(subscription.created_at)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if sortedSubscriptions.length === 0}
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Subscriptions</h3>
            <p class="mt-1 text-sm text-gray-500">Es wurden noch keine Abonnements erstellt.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
