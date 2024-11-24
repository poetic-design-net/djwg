<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { goto } from '$app/navigation';
  import NewsletterToggle from '$lib/components/NewsletterToggle.svelte';

  export let data;
  const { user } = data;

  const supabase = getContext<SupabaseClient>('supabase');

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      goto('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
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
        class="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition duration-300"
      >
        Abmelden
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
                <p class="text-white font-medium">{user.user_metadata?.firstname || user.user_metadata?.name}</p>
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

      <!-- Newsletter Preferences -->
      <div class="relative rounded-3xl p-8 border border-gray-800 overflow-hidden">
        <div class="absolute inset-0 mix-blend-overlay noise-filter"></div>
        <div class="relative">
          <h2 class="text-2xl font-medium text-white mb-6">Newsletter Preferences</h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-white font-medium">DJ Workshop Newsletter</h3>
                <p class="text-gray-400 text-sm">Receive updates about new workshops and events</p>
              </div>
              <NewsletterToggle 
                {user}
                initialStatus={user.user_metadata?.newsletter_subscribed || false}
              />
            </div>
          </div>
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
</style>
