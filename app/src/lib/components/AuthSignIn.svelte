<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import type { AuthPageData } from '../../routes/auth/+page';
  import type { SupabaseClient } from '@supabase/supabase-js';
  
  export let data: AuthPageData;
  let { user, supabase } = data;
  $: ({ user, supabase } = data);
  
  let email = '';
  let password = '';
  let firstName = '';
  let lastName = '';
  let loading = false;
  let errorMsg = '';
  let showPassword = false;
  let isRegistering = false;
  let isCheckingAuth = true;
  let mounted = false;
  
  // Initialize URL parameters after hydration
  let next = '/dashboard';
  let register = false;

  onMount(() => {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      register = urlParams.get('register') === 'true';
      isRegistering = register;
    }
    mounted = true;
    isCheckingAuth = false;
  });

  // Only redirect if we have a confirmed authenticated user and we're mounted
  $: if (mounted && user?.aud === 'authenticated' && browser) {
    goto(next);
  }

  const handleSignIn = async () => {
    if (!mounted) return;
    
    try {
      loading = true;
      errorMsg = '';

      if (!email || !password) {
        errorMsg = 'Bitte geben Sie E-Mail und Passwort ein';
        toasts.error(errorMsg);
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        toasts.error(errorMsg);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        errorMsg = signInError.message;
        toasts.error('Anmeldung fehlgeschlagen');
        return;
      }

      // Nach erfolgreicher Anmeldung direkt invalidieren und weiterleiten
      await invalidateAll();
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
      toasts.error(errorMsg);
      loading = false;
    }
  };

  const handleSignUp = async () => {
    try {
      loading = true;
      errorMsg = '';

      if (!email || !password || !firstName || !lastName) {
        errorMsg = 'Bitte füllen Sie alle Felder aus';
        toasts.error(errorMsg);
        loading = false;
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        toasts.error(errorMsg);
        loading = false;
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            raw_user_meta_data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        errorMsg = signUpError.message;
        toasts.error('Registrierung fehlgeschlagen');
        loading = false;
        return;
      }

      loading = false;
      errorMsg = 'Überprüfe Deine E-Mail für den Bestätigungslink.';
      toasts.success('Registrierung erfolgreich. Bitte überprüfe Deie E-Mail.');
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
      toasts.error(errorMsg);
      loading = false;
    }
  };

  const handleSignInWithGoogle = async () => {
    if (!mounted) return;
    
    try {
      loading = true;
      
      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        toasts.error(errorMsg);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        errorMsg = error.message;
        toasts.error('Google-Anmeldung fehlgeschlagen');
        return;
      }
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
      toasts.error(errorMsg);
    }
  };

const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };

  const toggleAuthMode = () => {
    isRegistering = !isRegistering;
    errorMsg = '';
  };
</script>


  {#if isCheckingAuth}
  <div class="flex justify-center items-center h-screen">
    <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-1 border-green-500"></div>
  </div>
{:else if !user?.aud || user.aud !== 'authenticated'}
  <div class="flex flex-wrap">
    <div class="w-full md:w-1/2 p-4 md:p-8">
      <div class="px-4 pt-10 md:pb-40 max-w-lg mx-auto">
        <div class="flex flex-wrap items-center justify-between mb-36 -m-2">
          <div class="w-auto p-2">
            <p class="text-sm text-gray-300">
              <span>{isRegistering ? 'Schon ein Konto?' : 'Noch kein Konto?'}</span>
              <button
                class="underline ml-1"
                on:click={toggleAuthMode}
              >
                {isRegistering ? 'Anmelden' : 'Registrieren'}
              </button>
            </p>
          </div>
        </div>
        <div class="text-center mx-auto">
          <h3 class="mb-4 text-5xl text-white tracking-5xl">
            {isRegistering ? 'Registriere Dich' : 'Melde Dich in Deinem Konto an'}
          </h3>
          <p class="mb-10 text-gray-300">
            {isRegistering ? 'Erstelle Dein Konto' : 'Schön, Dich wiederzusehen!'}
          </p>
          
          {#if errorMsg}
            <div class="mb-4 p-4 {errorMsg === 'Überprüfe Deine E-Mail für den Bestätigungslink.' ? 'bg-green-500 bg-opacity-10 text-green-500' : 'bg-red-500 bg-opacity-10 text-red-500'} rounded-3xl">
              {errorMsg}
            </div>
          {/if}

          {#if isRegistering}
            <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
              <input
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent"
                type="text"
                placeholder="Vorname"
                bind:value={firstName}
                disabled={loading}
              >
            </div>
            <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
              <input
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent"
                type="text"
                placeholder="Nachname"
                bind:value={lastName}
                disabled={loading}
              >
            </div>
          {/if}

          <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <input
              class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent"
              type="email"
              placeholder="Gebe Deine E-Mail-Adresse ein"
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
              <img src="nightsable-assets/images/sign-in/eyeslash.svg" alt="Passwort-Sichtbarkeit umschalten">
            </button>
            {#if showPassword}
              <input
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent"
                type="text"
                placeholder="Passwort"
                bind:value={password}
                disabled={loading}
              >
            {:else}
              <input
                class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent"
                type="password"
                placeholder="Passwort"
                bind:value={password}
                disabled={loading}
              >
            {/if}
          </div>
          <button
            class="block w-full mb-6 px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50"
            on:click={isRegistering ? handleSignUp : handleSignIn}
            disabled={loading}
          >
            {loading ? 'Laden...' : (isRegistering ? 'Registrieren' : 'Anmelden')}
          </button>
          
          {#if !isRegistering}
            <button class="mb-10 inline-block text-sm text-gray-300 underline">Passwort vergessen?</button>
          {/if}
          
          <div class="flex flex-wrap items-center mb-8">
            <div class="flex-1 bg-gray-900">
              <div class="h-px"></div>
            </div>
            <div class="px-5 text-xs text-gray-300 font-medium">oder {isRegistering ? 'registrieren' : 'anmelden'} mit</div>
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
                <span class="text-sm text-white font-medium">Mit Google {isRegistering ? 'registrieren' : 'anmelden'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full md:w-1/2 p-4 md:p-8">
      <div class="p-5 h-full">
        <img class="h-full mx-auto md:mr-0 object-cover rounded-5xl" src="https://cdn.sanity.io/images/kijh3dc6/production/4bc03b1c7ccffb71c9cb9d2883a11ad890066031-1024x1536.jpg" alt="Hintergrund">
      </div>
    </div>
  </div>
{/if}