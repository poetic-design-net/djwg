<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  
  type PricingPlan = {
    _id: string;
    key: string;
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    interval: string;
    intervalCount: number;
    features: string[];
  };

  let plans: PricingPlan[] = [];
  let loading = false;
  let selectedPlan: string | null = null;
  let error = '';

  // Preise formatieren
  function formatPrice(priceInCents: number): string {
    return (priceInCents / 100).toFixed(0);
  }

  // Ersparnis berechnen
  function calculateSavings(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  // Checkout-Session erstellen
  async function handleSubscribe(planKey: string) {
    if (loading) return;
    loading = true;
    selectedPlan = planKey;
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planKey,
          successUrl: `${window.location.origin}/nextlevel-djs/success`,
          cancelUrl: `${window.location.origin}/nextlevel-djs`
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Checkout-Session');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (err) {
      console.error('Checkout-Fehler:', err);
      alert('Fehler beim Weiterleiten zur Zahlung. Bitte versuche es erneut.');
    } finally {
      loading = false;
      selectedPlan = null;
    }
  }

  // Pläne aus Sanity laden
  onMount(async () => {
    try {
      const res = await fetch('/api/pricing-plans');
      if (!res.ok) throw new Error('Fehler beim Laden der Preispläne');
      plans = await res.json();
    } catch (e) {
      error = 'Preispläne konnten nicht geladen werden.';
    }
  });
</script>

{#if error}
  <div class="text-red-500 text-center py-8">{error}</div>
{:else if plans.length === 0}
  <div class="text-white/60 text-center py-8">Lade Preispläne...</div>
{:else}
<div class="max-w-6xl mx-auto px-4 py-16">
  <!-- Header -->
  <div class="text-center mb-16">
    <h2 class="text-4xl md:text-5xl font-medium text-white mb-4">
      Wähle deinen NextLevel Plan
    </h2>
    <p class="text-xl text-white/80 max-w-2xl mx-auto">
      Erhalte Zugang zu exklusiven DJ-Videos, Musikdownloads und der Community
    </p>
  </div>

  <!-- Pricing Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    {#each plans as plan, i}
      {@const isPopular = plan.key === 'quarterly'}
      {@const savings = calculateSavings(plan.originalPrice, plan.price)}
      <div class="relative">
        <!-- Popular Badge -->
        {#if isPopular}
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <span class="bg-green-500 text-black px-4 py-2 rounded-full text-sm font-medium">
              Beliebteste Wahl
            </span>
          </div>
        {/if}
        <!-- Card -->
        <div class="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden hover:border-green-500/50 transition-all duration-300 {isPopular ? 'border-green-500/30 scale-105' : ''}">
          <!-- Background Glow -->
          {#if isPopular}
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl" />
          {/if}
          <div class="relative z-10">
            <!-- Plan Name -->
            <h3 class="text-2xl font-medium text-white mb-2">{plan.name}</h3>
            <p class="text-white/60 mb-6">{plan.description}</p>
            <!-- Pricing -->
            <div class="mb-8">
              <div class="flex items-baseline gap-2 mb-2">
                <span class="text-4xl font-medium text-white">€{formatPrice(plan.price)}</span>
                <span class="text-white/60">/ {plan.interval === 'year' ? 'Jahr' : plan.intervalCount === 3 ? '3 Monate' : 'Monat'}</span>
              </div>
              {#if savings > 0}
                <div class="flex items-center gap-2">
                  <span class="text-white/40 line-through">€{formatPrice(plan.originalPrice)}</span>
                  <span class="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    -{savings}%
                  </span>
                </div>
              {/if}
            </div>
            <!-- Features -->
            <ul class="space-y-3 mb-8">
              {#each plan.features as feature}
                <li class="flex items-center gap-3 text-white/80">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
            <!-- CTA Button -->
            <button
              on:click={() => handleSubscribe(plan.key)}
              disabled={loading}
              class="w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 {
                isPopular 
                  ? 'bg-green-500 hover:bg-green-600 text-black' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
              } disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if loading && selectedPlan === plan.key}
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Wird geladen...</span>
                </div>
              {:else}
                Jetzt starten
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Info Text -->
  <div class="mt-12 text-center">
    <p class="text-white/60 text-sm">
      Alle Preise inkl. MwSt. • Jederzeit kündbar • Sichere Zahlung mit Stripe
    </p>
    <div class="flex justify-center gap-6 mt-4 text-white/40 text-xs">
      <span>30 Tage Geld-zurück-Garantie</span>
      <span>•</span>
      <span>Keine versteckten Kosten</span>
      <span>•</span>
      <span>Sofortiger Zugang</span>
    </div>
  </div>
</div>
{/if}