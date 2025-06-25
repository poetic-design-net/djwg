<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';
  export let data;

  let sessionId = '';
  let loading = true;
  let error = '';

  onMount(() => {
    // Stripe Session ID aus URL-Parameter extrahieren
    sessionId = $page.url.searchParams.get('session_id') || '';
    
    if (!sessionId) {
      error = 'Keine Session-ID gefunden. Bitte versuche es erneut.';
    }
    
    loading = false;
    
    // Nach 5 Sekunden automatisch zu NextLevel DJs weiterleiten
    setTimeout(() => {
      goto('/nextlevel-djs');
    }, 5000);
  });

  function goToNextLevel() {
    goto('/nextlevel-djs');
  }

  function goToDashboard() {
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Willkommen bei NextLevel DJs! - DJWG</title>
  <meta name="description" content="Erfolgreich registriert für NextLevel DJs Academy" />
</svelte:head>

<div class="min-h-screen bg-black text-white flex items-center justify-center">
  <div class="max-w-2xl mx-auto px-4 text-center">
    {#if loading}
      <div class="flex items-center justify-center mb-8">
        <div class="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h1 class="text-3xl font-medium mb-4">Verarbeitung...</h1>
      <p class="text-white/60">Deine Zahlung wird verarbeitet.</p>
    {:else if error}
      <div class="mb-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 class="text-3xl font-medium mb-4 text-red-500">Fehler</h1>
      <p class="text-white/60 mb-8">{error}</p>
      <button 
        on:click={goToNextLevel}
        class="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-3 rounded-xl transition-colors"
      >
        Zurück zu NextLevel DJs
      </button>
    {:else}
      <!-- Success Content -->
      <div class="mb-8">
        <div class="relative w-24 h-24 mx-auto mb-6">
          <div class="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
          <div class="relative bg-green-500 rounded-full w-24 h-24 flex items-center justify-center">
            <svg class="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <h1 class="text-4xl md:text-5xl font-medium mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
        Willkommen bei NextLevel DJs!
      </h1>
      
      <p class="text-xl text-white/80 mb-8">
        Deine Zahlung war erfolgreich und du hast jetzt Zugang zu allen NextLevel DJs Inhalten!
      </p>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white/5 border border-white/10 rounded-xl p-6">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="font-medium mb-2">Exklusive Videos</h3>
          <p class="text-sm text-white/60">Zugang zu allen DJ-Tutorial Videos</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-6">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 class="font-medium mb-2">Musik Downloads</h3>
          <p class="text-sm text-white/60">Lade Tracks in verschiedenen Formaten herunter</p>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-6">
          <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="font-medium mb-2">Community</h3>
          <p class="text-sm text-white/60">Tausche dich mit anderen DJs aus</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          on:click={goToNextLevel}
          class="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Zu NextLevel DJs
        </button>
        <button 
          on:click={goToDashboard}
          class="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 font-medium px-8 py-3 rounded-xl transition-all"
        >
          Zum Dashboard
        </button>
      </div>

      <!-- Auto Redirect Info -->
      <p class="text-sm text-white/40 mt-8">
        Du wirst automatisch in 5 Sekunden weitergeleitet...
      </p>

      {#if sessionId}
        <p class="text-xs text-white/30 mt-4">
          Session: {sessionId.substring(0, 20)}...
        </p>
      {/if}
    {/if}
  </div>
</div>

<style>
.success-container {
  max-width: 500px;
  margin: 4rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  text-align: center;
}
.success-container h1 {
  color: #16a34a;
  margin-bottom: 1rem;
}
.btn {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  background: #16a34a;
  color: #fff;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.2s;
}
.btn:hover {
  background: #15803d;
}
</style>