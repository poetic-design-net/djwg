<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import type { AuthPageData } from '../../routes/auth/+page';
  import type { SupabaseClient } from '@supabase/supabase-js';

  export let data: AuthPageData;
  let { user } = data;
  $: ({ user } = data);

  // Get Supabase client from context
  const supabase = getContext<SupabaseClient>('supabase');

  let email = '';
  let password = '';
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

  const handleSignIn = async () => {
    try {
      loading = true;
      errorMsg = '';

      if (!email || !password) {
        errorMsg = 'Please enter both email and password';
        loading = false;
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentication service unavailable. Please try again later.';
        loading = false;
        return;
      }

      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        errorMsg = signInError.message;
        loading = false;
        return;
      }

      // Verify the user after sign in
      const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser();

      if (verifyError) {
        console.error('Verify error:', verifyError);
        errorMsg = 'Error verifying user';
        loading = false;
        return;
      }

      if (!verifiedUser || verifiedUser.aud !== 'authenticated') {
        console.error('User not authenticated after sign in');
        errorMsg = 'Authentication failed';
        loading = false;
        return;
      }

      // Successfully authenticated
      loading = false;
      await invalidateAll(); // Refresh auth state
      if (browser) {
        goto(next);
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      errorMsg = 'An unexpected error occurred';
      loading = false;
    }
  };

  const handleSignUp = async () => {
    try {
      loading = true;
      errorMsg = '';

      if (!email || !password) {
        errorMsg = 'Please enter both email and password';
        loading = false;
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentication service unavailable. Please try again later.';
        loading = false;
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        errorMsg = error.message;
        loading = false;
        return;
      }

      loading = false;
      errorMsg = 'Check your email for the confirmation link.';
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      errorMsg = 'An unexpected error occurred';
      loading = false;
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      if (!supabase) {
        errorMsg = 'Authentication service unavailable. Please try again later.';
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
      errorMsg = 'An unexpected error occurred';
    }
  };

  const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };
  // Script content remains unchanged
</script>

{#if !user?.aud || user.aud !== 'authenticated'}
  <div class="flex flex-wrap -m-8">
    <div class="w-full md:w-1/2 p-8">
      <div class="px-4 pt-10 md:pb-40 max-w-lg mx-auto">
        <div class="flex flex-wrap items-center justify-between mb-36 -m-2">
          <div class="w-auto p-2">
            <p class="text-sm text-gray-300">
              <span>Noch kein Konto?</span>
              <a href=/sign-up/ 
                class="underline ml-1" 
               
              >
                Registrieren
            </a>
            </p>
          </div>
        </div>
        <div class="text-center mx-auto">
          <h3 class="mb-4 text-5xl text-white tracking-5xl">Melden Sie sich in Ihrem Konto an</h3>
          <p class="mb-10 text-gray-300">Schön, Sie wiederzusehen!</p>
          
          {#if errorMsg}
            <div class="mb-4 p-4 bg-red-500 bg-opacity-10 text-red-500 rounded-3xl">
              {errorMsg}
            </div>
          {/if}

          <div class="mb-2 border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <input 
              class="pl-6 pr-16 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
              type="email" 
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
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
            on:click={handleSignIn}
            disabled={loading}
          >
            {loading ? 'Laden...' : 'Anmelden'}
          </button>
          
          <button class="mb-10 inline-block text-sm text-gray-300 underline">Passwort vergessen?</button>
          
          <div class="flex flex-wrap items-center mb-8">
            <div class="flex-1 bg-gray-900">
              <div class="h-px"></div>
            </div>
            <div class="px-5 text-xs text-gray-300 font-medium">oder anmelden mit</div>
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
                <span class="text-sm text-white font-medium">Mit Google anmelden</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full md:w-1/2 p-8">
      <div class="p-5 h-full">
        <img class="h-full mx-auto md:mr-0 object-cover rounded-5xl" src="nightsable-assets/images/sign-in/stock.png" alt="Hintergrund">
      </div>
    </div>
  </div>
{/if}
