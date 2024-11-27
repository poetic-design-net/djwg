<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import { invalidate, invalidateAll } from '$app/navigation';
  import NewsletterToggle from '$lib/components/NewsletterToggle.svelte';
  import { onMount } from 'svelte';

  export let data: {
    user: {
      email: string;
      created_at: string;
      user_metadata?: {
        firstname?: string;
        name?: string;
      };
      aud?: string;
    };
  };
  
  const { user } = data;

  const supabase = getContext<SupabaseClient>('supabase');
  let loading = false;

  onMount(() => {
    // Pre-fill form fields if user data exists
    if (user) {
      const emailInput = document.getElementById('mce-EMAIL') as HTMLInputElement;
      const firstNameInput = document.getElementById('mce-FNAME') as HTMLInputElement;
      if (emailInput) emailInput.value = user.email || '';
      if (firstNameInput) firstNameInput.value = user.user_metadata?.firstname || user.user_metadata?.name || '';
    }
  });

  const handleLogout = async () => {
    if (loading) return;
    
    loading = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      // Invalidate auth state first
      await invalidate('supabase:auth');
      await invalidateAll();
      
      goto('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      loading = false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('In die Zwischenablage kopiert!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
</script>

<div class="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <!-- Dashboard Header with Logout -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-medium text-white mb-2">Dashboard</h1>
        <p class="text-gray-400">Manage your profile and preferences</p>
      </div>
      <button 
        on:click={handleLogout}
        disabled={loading}
        class="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird abgemeldet...' : 'Abmelden'}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Profile Information -->
      <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative">
          <h2 class="text-2xl font-medium text-white mb-6">Profile Information</h2>
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Email</p>
                <p class="text-white font-medium">{user.email}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Name</p>
                <p class="text-white font-medium">{user.user_metadata?.firstname || user.user_metadata?.name || ''}</p>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div class="bg-gray-950 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-gray-400">Member Since</p>
                <p class="text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative">
          <h2 class="text-2xl font-medium text-white mb-6">Online Talk & Unterstützung</h2>
          
          <!-- Online Talk Access -->
          <div class="mb-8">
            <h3 class="text-xl font-medium text-white mb-4">Zugang zum Online Talk "Urheberrechtsverletzung & Relaunch"</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <a 
                  href="https://tinyurl.com/27rk64ue"
                  target="_blank"
                  class="flex-1 px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl text-center transition duration-300"
                >
                  Zum Online Talk
                </a>
              </div>
              <div class="flex items-center space-x-3">
                <button 
                  class="flex-1 px-6 py-3 text-sm font-medium text-white bg-gray-950 hover:bg-gray-900 rounded-xl text-center transition duration-300"
                  on:click={() => copyToClipboard('ZQ9U')}
                >
                  Passwort: ZQ9U (Klicken zum Kopieren)
                </button>
              </div>
            </div>
          </div>

          <!-- Support Options -->
          <div>
            <h3 class="text-xl font-medium text-white mb-4">Unterstütze DJ Workshop</h3>
            <p class="text-gray-400 mb-4">
              Hilf uns dabei, die DJ Community weiter zu fördern und neue Workshops anzubieten.
            </p>
            <div class="space-y-4">
              <a 
                href="https://buymeacoffee.com/djworkshopgermany"
                target="_blank"
                class="block px-6 py-3 text-sm font-medium text-black bg-yellow-500 hover:bg-yellow-400 rounded-xl text-center transition duration-300"
              >
                Buy me a Coffee ☕
              </a>
              <a 
                href="https://gofund.me/b30d051e"
                target="_blank"
                class="block px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl text-center transition duration-300"
              >
                GoFundMe Kampagne 🎵
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Subscription -->
      <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative">
          <h2 class="text-2xl font-medium text-white mb-6">Newsletter Anmeldung</h2>
          <form 
            action="https://djworkshopgermany.us17.list-manage.com/subscribe/post?u=0a45dba5a58068d990b9b4e12&amp;id=7be52bea2f&amp;f_id=002aa0e2f0" 
            method="post" 
            id="mc-embedded-subscribe-form" 
            name="mc-embedded-subscribe-form" 
            class="validate space-y-4" 
            target="_blank"
          >
            <div class="space-y-4">
              <!-- Phone Number Field -->
              <div>
                <label for="mce-SMSPHONE" class="block text-sm font-medium text-gray-400 mb-2">
                  Telefonnummer (optional)
                </label>
                <div class="flex items-center border border-gray-800 rounded-xl bg-gray-950 overflow-hidden">
                  <div class="px-4 py-2 border-e border-gray-800">
                    <img 
                      src="https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/forms-landing-pages/smsphone/flag-germany.svg" 
                      alt="Country Code" 
                      width="28" 
                      height="28"
                    >
                  </div>
                  <input 
                    type="text" 
                    name="SMSPHONE" 
                    id="mce-SMSPHONE"
                    class="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                </div>
                <div class="mt-2 flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="mc-SMSPHONE-ack"
                    id="mc-SMSPHONE-ack"
                    value="true"
                    class="mt-1 h-4 w-4 text-green-500 bg-transparent border-gray-800 rounded focus:ring-green-500"
                  >
                  <label for="mc-SMSPHONE-ack" class="text-xs text-gray-400">
                    Ich möchte Werbe- und Marketingnachrichten von DJWorkshop erhalten. 
                    <a href="http://eepurl.com/i4jcm2" target="_blank" class="text-green-500 hover:text-green-400">Nutzungsbedingungen</a>
                  </label>
                </div>
              </div>

              <!-- Email Field -->
              <div>
                <label for="mce-EMAIL" class="block text-sm font-medium text-gray-400 mb-2">
                  E-Mail Adresse <span class="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="EMAIL" 
                  id="mce-EMAIL" 
                  required
                  class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
              </div>

              <!-- First Name Field -->
              <div>
                <label for="mce-FNAME" class="block text-sm font-medium text-gray-400 mb-2">
                  Vorname
                </label>
                <input 
                  type="text" 
                  name="FNAME" 
                  id="mce-FNAME"
                  class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
              </div>

              <!-- Required field notice -->
              <p class="text-sm text-gray-400">
                <span class="text-red-500">*</span> Pflichtfeld
              </p>

              <!-- Submit Button -->
              <button 
                type="submit" 
                name="subscribe" 
                id="mc-embedded-subscribe"
                class="w-full px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300"
              >
                Newsletter abonnieren
              </button>
            </div>

            <!-- Hidden Fields -->
            <div style="position: absolute; left: -5000px;" aria-hidden="true">
              <input type="text" name="b_0a45dba5a58068d990b9b4e12_7be52bea2f" tabindex="-1" value="">
            </div>

            <!-- Response Messages -->
            <div id="mce-responses" class="mt-4">
              <div id="mce-error-response" class="hidden"></div>
              <div id="mce-success-response" class="hidden"></div>
            </div>
          </form>
        </div>
      </div>

      <!-- Useful Links -->
      <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative">
          <h2 class="text-2xl font-medium text-white mb-6">Useful Links</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/events" 
              class="group flex items-center space-x-3 p-4 rounded-xl bg-gray-950 hover:bg-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-white group-hover:text-black transition-colors duration-200">Upcoming Events</span>
            </a>
            <a 
              href="/equipment" 
              class="group flex items-center space-x-3 p-4 rounded-xl bg-gray-950 hover:bg-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="text-white group-hover:text-black transition-colors duration-200">Equipment Guide</span>
            </a>
            <a 
              href="/faq" 
              class="group flex items-center space-x-3 p-4 rounded-xl bg-gray-950 hover:bg-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-white group-hover:text-black transition-colors duration-200">FAQ</span>
            </a>
            <a 
              href="/feedback" 
              class="group flex items-center space-x-3 p-4 rounded-xl bg-gray-950 hover:bg-green-500 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span class="text-white group-hover:text-black transition-colors duration-200">Feedback</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Online Talk Access & Support -->
      
    </div>
  </div>
</div>

<style>
  .noise-filter {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
  }

  /* Override any Mailchimp default styles */
  :global(#mc_embed_signup) {
    background: transparent !important;
    font-family: inherit !important;
    width: 100% !important;
  }

  :global(#mc_embed_signup form) {
    padding: 0 !important;
  }

  :global(#mc_embed_signup .mc-field-group) {
    width: 100% !important;
    padding-bottom: 0 !important;
    min-height: 0 !important;
  }
</style>
