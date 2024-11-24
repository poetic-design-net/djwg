<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import type { AuthPageData } from './+page';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { bentoClient } from '$lib/bento/client';
  
  export let data: AuthPageData;
  let { user } = data;
  $: ({ user } = data);

  // Get Supabase client from context
  const supabase = getContext<SupabaseClient>('supabase');

  let firstname = '';
  let email = '';
  let password = '';
  let newsletterEnabled = false;
  let loading = false;
  let errorMsg = '';
  let showPassword = false;

  // Get the 'next' parameter from URL if it exists, safely
  let next = '/';
  if (browser) {
    next = new URLSearchParams(window.location.search).get('next') ?? '/';
  }

  // Only redirect if we have a confirmed authenticated user
  $: if (user?.aud === 'authenticated' && browser) {
    goto(next);
  }

  const handleSignUp = async () => {
    try {
      loading = true;
      errorMsg = '';
      
      if (!firstname || !email || !password) {
        errorMsg = 'Bitte fülle alle Felder aus';
        loading = false;
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        loading = false;
        return;
      }

      let bentoSubscribed = false;

      // If newsletter is enabled, subscribe to Bento first
      if (newsletterEnabled) {
        try {
          await bentoClient.subscribe({
            email,
            firstName: firstname
          });
          bentoSubscribed = true;
        } catch (error) {
          console.error('Newsletter subscription failed:', error);
          // Show error but continue with signup
          errorMsg = 'Newsletter-Anmeldung fehlgeschlagen, aber Registrierung wird fortgesetzt.';
        }
      }

      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstname,
            newsletter_subscribed: bentoSubscribed
          },
          emailRedirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        // If signup fails and newsletter was subscribed, try to unsubscribe
        if (bentoSubscribed) {
          try {
            await bentoClient.unsubscribe(email);
          } catch (unsubError) {
            console.error('Failed to revert newsletter subscription:', unsubError);
          }
        }

        console.error('Sign up error:', error);
        errorMsg = error.message;
        loading = false;
        return;
      }

      loading = false;
      errorMsg = 'Überprüfe deine E-Mails für den Bestätigungslink.';
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      errorMsg = error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten';
      loading = false;
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        errorMsg = error.message;
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      errorMsg = error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten';
    }
  };

  const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };
</script>

<svelte:head>
  <title>Registrieren | DJ Workshop</title>
  <meta name="description" content="Erstelle dein Konto beim DJ Workshop und werde Teil unserer Community." />
</svelte:head>

{#if !user?.aud || user.aud !== 'authenticated'}
  <div class="flex flex-wrap -m-8">
    <div class="w-full md:w-1/2 p-8">
      <div class="px-4 pt-10 md:pb-40 max-w-lg mx-auto">
        <div class="flex flex-wrap items-center justify-between mb-36 -m-2">
          <div class="w-auto p-2">
            <p class="text-sm text-gray-300">
              <span>Bereits ein Konto?</span>
              <a 
                href="/auth"
                class="underline ml-1"
              >
                Anmelden
              </a>
            </p>
          </div>
        </div>
        <div class="text-center mx-auto">
          <h1 class="mb-4 text-5xl text-white tracking-5xl">Erstelle dein Konto</h1>
          <p class="mb-10 text-gray-300">Werde Teil der DJ Workshop Community!</p>
          
          {#if errorMsg}
            <div class="mb-4 p-4 bg-red-500 bg-opacity-10 text-red-500 rounded-3xl">
              {errorMsg}
            </div>
          {/if}

          <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <input 
              class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
              type="text" 
              placeholder="Dein Vorname"
              bind:value={firstname}
              disabled={loading}
            >
          </div>

          <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <input 
              class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
              type="email" 
              placeholder="Deine E-Mail-Adresse"
              bind:value={email}
              disabled={loading}
            >
          </div>
          <div class="mb-6 relative border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <button 
              type="button"
              class="absolute right-7 top-1/2 transform -translate-y-1/2"
              on:click={togglePasswordVisibility}
            >
              <img src="nightsable-assets/images/sign-in/eyeslash.svg" alt="Passwort anzeigen/verbergen">
            </button>
            {#if showPassword}
              <input 
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
                type="text"
                placeholder="Wähle ein Passwort"
                bind:value={password}
                disabled={loading}
              >
            {:else}
              <input 
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
                type="password"
                placeholder="Wähle ein Passwort"
                bind:value={password}
                disabled={loading}
              >
            {/if}
          </div>

          <div class="mb-6 flex items-center justify-center space-x-2">
            <input
              type="checkbox"
              id="newsletter"
              bind:checked={newsletterEnabled}
              class="w-4 h-4 text-green-500 bg-transparent border-gray-900 rounded focus:ring-green-500"
            >
            <label for="newsletter" class="text-sm text-gray-300">
              Newsletter abonnieren und keine Events verpassen
            </label>
          </div>

          <button 
            class="block w-full mb-6 px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50" 
            on:click={handleSignUp}
            disabled={loading}
          >
            {loading ? 'Lädt...' : 'Konto erstellen'}
          </button>
          
          <p class="mb-10 text-sm text-gray-300">
            Mit der Registrierung akzeptierst du unsere 
            <a href="/datenschutz" class="underline">Datenschutzbestimmungen</a> und 
            <a href="/agb" class="underline">AGB</a>.
          </p>
          
          <div class="flex flex-wrap items-center mb-8">
            <div class="flex-1 bg-gray-900">
              <div class="h-px"></div>
            </div>
            <div class="px-5 text-xs text-gray-300 font-medium">oder registriere dich mit</div>
            <div class="flex-1 bg-gray-900">
              <div class="h-px"></div>
            </div>
          </div>
          
          <div class="flex flex-wrap -1 mb-7">
            <div class="w-full p-1">
              <button 
                class="w-full p-5 flex flex-wrap justify-center bg-gray-900 hover:bg-gray-900 bg-opacity-30 hover:bg-opacity-10 rounded-full transition duration-300"
                on:click={handleSignInWithGoogle}
                disabled={loading}
              >
                <div class="mr-4 inline-block">
                  <img src="nightsable-assets/images/sign-in/google.svg" alt="Google">
                </div>
                <span class="text-sm text-white font-medium">Mit Google registrieren</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full md:w-1/2 p-8">
      <div class="p-5 h-full">
        <img class="h-full mx-auto md:mr-0 object-cover rounded-5xl" src="nightsable-assets/images/sign-in/stock.png" alt="DJ Workshop">
      </div>
    </div>
  </div>
{/if}
