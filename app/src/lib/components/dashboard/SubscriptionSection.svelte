<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { 
    getCurrentSubscription, 
    formatSubscriptionStatus, 
    getDaysUntilPeriodEnd,
    isSubscriptionExpiringSoon,
    type NextLevelSubscription 
  } from '$lib/services/subscription';
  import CollapsibleSection from './CollapsibleSection.svelte';

  export let user: any;

  let subscription: NextLevelSubscription | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    if (user?.id) {
      try {
        subscription = await getCurrentSubscription(user.id);
      } catch (err) {
        console.error('Error loading subscription:', err);
        error = 'Fehler beim Laden der Subscription-Daten';
      } finally {
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      active: 'text-green-500',
      trialing: 'text-blue-500',
      past_due: 'text-yellow-500',
      canceled: 'text-red-500',
      incomplete: 'text-gray-500'
    };
    return colors[status] || 'text-gray-500';
  }

  async function handleManageSubscription() {
    // Hier würde normalerweise ein Link zum Stripe Customer Portal erstellt
    // Für jetzt zeigen wir eine Info-Nachricht
    alert('Subscription-Verwaltung wird bald verfügbar sein. Kontaktiere den Support für Änderungen.');
  }
</script>

<CollapsibleSection title="NextLevel DJs Abonnement" icon="💳" initiallyOpen={true}>
  <div class="space-y-4">
    {#if loading}
      <div class="flex items-center justify-center py-8">
        <div class="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="ml-2 text-white/60">Lade Subscription-Daten...</span>
      </div>
    {:else if error}
      <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p class="text-red-400">{error}</p>
      </div>
    {:else if !subscription}
      <!-- Kein aktives Abonnement -->
      <div class="bg-white/5 border border-white/10 rounded-lg p-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-white mb-2">Kein aktives Abonnement</h3>
          <p class="text-white/60 mb-4">
            Du hast derzeit kein aktives NextLevel DJs Abonnement.
          </p>
          <a 
            href="/nextlevel-djs" 
            class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Jetzt abonnieren
          </a>
        </div>
      </div>
    {:else}
      <!-- Aktives Abonnement -->
      <div class="bg-white/5 border border-white/10 rounded-lg p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-medium text-white mb-1">
              NextLevel DJs - {getPlanName(subscription.plan_type)}
            </h3>
            <p class="text-sm {getStatusColor(subscription.status)}">
              {formatSubscriptionStatus(subscription.status)}
            </p>
          </div>
          <div class="text-right">
            <div class="text-sm text-white/60">Nächste Abrechnung</div>
            <div class="text-white font-medium">
              {formatDate(subscription.current_period_end)}
            </div>
          </div>
        </div>

        <!-- Subscription Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-white/5 rounded-lg p-4">
            <div class="text-sm text-white/60 mb-1">Aktueller Zeitraum</div>
            <div class="text-white">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </div>
          </div>
          
          <div class="bg-white/5 rounded-lg p-4">
            <div class="text-sm text-white/60 mb-1">Verbleibende Tage</div>
            <div class="text-white">
              {getDaysUntilPeriodEnd(subscription.current_period_end)} Tage
            </div>
          </div>
        </div>

        <!-- Warnung bei bald ablaufendem Abo -->
        {#if isSubscriptionExpiringSoon(subscription)}
          <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-yellow-400 font-medium">Abonnement läuft bald ab</span>
            </div>
            <p class="text-yellow-300 text-sm mt-1">
              Dein Abonnement endet in {getDaysUntilPeriodEnd(subscription.current_period_end)} Tagen. 
              Es wird automatisch verlängert, falls nicht gekündigt.
            </p>
          </div>
        {/if}

        <!-- Gekündigtes Abo -->
        {#if subscription.cancel_at_period_end}
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span class="text-red-400 font-medium">Abonnement gekündigt</span>
            </div>
            <p class="text-red-300 text-sm mt-1">
              Dein Abonnement wurde gekündigt und endet am {formatDate(subscription.current_period_end)}.
              Du behältst bis dahin vollen Zugang.
            </p>
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            on:click={handleManageSubscription}
            class="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-medium px-4 py-2 rounded-lg transition-all"
          >
            Abonnement verwalten
          </button>
          
          <a 
            href="/nextlevel-djs"
            class="flex-1 bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded-lg transition-colors text-center"
          >
            Zu NextLevel DJs
          </a>
        </div>

        <!-- Subscription ID (für Support) -->
        <div class="mt-4 pt-4 border-t border-white/10">
          <div class="text-xs text-white/40">
            Subscription ID: {subscription.stripe_subscription_id}
          </div>
        </div>
      </div>
    {/if}
  </div>
</CollapsibleSection>
