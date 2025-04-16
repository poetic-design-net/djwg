<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getContext, onMount } from 'svelte';
  import { toasts } from '$lib/stores/toast';
  import { subscribeEmailToMailchimp } from '$lib/services/newsletter';
  import type { AuthPageData } from '../../routes/auth/+page';
  import type { SupabaseClient, AuthError } from '@supabase/supabase-js';
  
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
  let subscribeToNewsletter = false;
  let isRegistering = false;
  let isCheckingAuth = true;
  let mounted = false;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  // Initialize URL parameters after hydration
  let next = '/dashboard';
  let register = false;

  const passwordStrengthRegex = {
    hasNumber: /\d/,
    hasUpper: /[A-Z]/,
    hasLower: /[a-z]/,
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
    minLength: 8
  };

  function validatePassword(pwd: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (pwd.length < passwordStrengthRegex.minLength) {
      errors.push(`Passwort muss mindestens ${passwordStrengthRegex.minLength} Zeichen lang sein`);
    }
    if (!passwordStrengthRegex.hasNumber.test(pwd)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    if (!passwordStrengthRegex.hasUpper.test(pwd)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    if (!passwordStrengthRegex.hasLower.test(pwd)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    if (!passwordStrengthRegex.hasSpecial.test(pwd)) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async function handleAuthError(error: AuthError | null): Promise<boolean> {
    if (!error) return false;

    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Ungültige Anmeldedaten',
      'Email not confirmed': 'E-Mail wurde noch nicht bestätigt',
      'Rate limit exceeded': 'Zu viele Versuche. Bitte warten Sie einen Moment.',
      'User already registered': 'Diese E-Mail ist bereits registriert',
      'Password recovery required': 'Passwort-Zurücksetzung erforderlich',
      'Network error': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.'
    };

    const message = errorMap[error.message] || error.message;
    errorMsg = message;
    toasts.error(message);

    // Prüfen ob Retry sinnvoll ist
    const retryableErrors = ['Network error', 'Rate limit exceeded'];
    if (retryableErrors.includes(error.message) && retryCount < MAX_RETRIES) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
      return true; // Retry durchführen
    }

    return false; // Kein Retry
  }

  onMount(() => {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      register = urlParams.get('register') === 'true';
      isRegistering = register;
      next = urlParams.get('next') || '/dashboard';
    }
    mounted = true;
    isCheckingAuth = false;
  });

  // Redirect wenn authentifiziert
  $: if (mounted && user?.aud === 'authenticated' && browser) {
    goto(next);
  }

  const handleSignIn = async () => {
    if (!mounted) return;
    
    try {
      loading = true;
      errorMsg = '';
      retryCount = 0;

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

      let success = false;
      while (!success && retryCount <= MAX_RETRIES) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          const shouldRetry = await handleAuthError(signInError);
          if (!shouldRetry) break;
          continue;
        }

        success = true;
      }

      if (success) {
        await invalidateAll();
      }
    } catch (error) {
      errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
      toasts.error(errorMsg);
      throw error; // Sentry wird den Fehler automatisch erfassen
    } finally {
      loading = false;
    }
  };

  const handleSignUp = async () => {
    try {
      loading = true;
      errorMsg = '';
      retryCount = 0;

      if (!email || !password || !firstName || !lastName) {
        errorMsg = 'Bitte füllen Sie alle Felder aus';
        toasts.error(errorMsg);
        return;
      }

      // Passwort-Validierung
      const { isValid, errors } = validatePassword(password);
      if (!isValid) {
        errorMsg = errors.join('\n');
        toasts.error(errorMsg);
        return;
      }

      if (!supabase) {
        errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
        toasts.error(errorMsg);
        return;
      }

      let success = false;
      while (!success && retryCount <= MAX_RETRIES) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`
            }
          }
        });

        if (signUpError) {
          const shouldRetry = await handleAuthError(signUpError);
          if (!shouldRetry) break;
          continue;
        }

        success = true;
      }

      if (success) {
        errorMsg = 'Überprüfe Deine E-Mail für den Bestätigungslink.';
        toasts.success('Registrierung erfolgreich. Bitte überprüfe Deine E-Mail.');
        if (subscribeToNewsletter) {
          try {
            await subscribeEmailToMailchimp(email);
            console.log('Für Newsletter angemeldet');
          } catch (e) {
            console.error('Newsletter Anmeldung fehlgeschlagen:', e);
          }
        }
      }
    } catch (error) {
      errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
      toasts.error(errorMsg);
      throw error; // Sentry wird den Fehler automatisch erfassen
    } finally {
      loading = false;
    }
  };

  const handleSignInWithGoogle = async () => {
  if (!mounted) return;
  
  try {
    loading = true;
    retryCount = 0;
    
    if (!supabase) {
      errorMsg = 'Authentifizierungsdienst nicht verfügbar. Bitte versuche es später erneut.';
      toasts.error(errorMsg);
      return;
    }

    // Save newsletter status and email for processing after authentication
    const wantsNewsletter = subscribeToNewsletter;
    const userEmail = email;
    
    // Store newsletter preference in localStorage instead of state parameter
    if (browser) {
      localStorage.setItem('wants_newsletter', wantsNewsletter.toString());
      if (userEmail) {
        localStorage.setItem('user_email', userEmail);
      }
    }

    let success = false;
    while (!success && retryCount <= MAX_RETRIES) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${browser ? location.origin : ''}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
            // Remove custom state parameter - let Supabase handle it
          }
        }
      });

      if (error) {
        const shouldRetry = await handleAuthError(error);
        if (!shouldRetry) break;
        continue;
      }

      success = true;
    }
  } catch (error) {
    errorMsg = 'Ein unerwarteter Fehler ist aufgetreten';
    toasts.error(errorMsg);
    throw error; // Sentry wird den Fehler automatisch erfassen
  } finally {
    loading = false;
  }
};

  const togglePasswordVisibility = () => {
    showPassword = !showPassword;
  };

  const toggleAuthMode = () => {
    isRegistering = !isRegistering;
    errorMsg = '';
    email = '';
    password = '';
    firstName = '';
    lastName = '';
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
            <p class="text-sm text-green-500">
              <span>{isRegistering ? 'Schon ein Konto?' : 'Noch kein Konto?'}</span>
              <button
                class="underline ml-1"
                on:click={toggleAuthMode}
              >
               <span class="font-medium">{isRegistering ? 'Anmelden' : 'Registrieren'}</span> 
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
            <div class="mb-4 p-4 {errorMsg === 'Überprüfe Deine E-Mail für den Bestätigungslink.' ? 'bg-green-500 bg-opacity-10 text-green-500' : 'bg-red-500 bg-opacity-10 text-red-500'} rounded-3xl whitespace-pre-line">
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

          {#if isRegistering}
            <div class="mb-6 flex items-center">
              <div class="relative flex items-center">
                <input
                  id="newsletter"
                  type="checkbox"
                  bind:checked={subscribeToNewsletter}
                  disabled={loading}
                  class="sr-only peer"
                />
                <div
                  class="w-5 h-5 border border-gray-500 rounded peer-checked:bg-green-400 peer-checked:border-green-400 transition-all duration-200 flex items-center justify-center cursor-pointer"
                  on:click={() => {
                    if (!loading) {
                      subscribeToNewsletter = !subscribeToNewsletter;
                    }
                  }}
                >
                  {#if subscribeToNewsletter}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </div>
                <label for="newsletter" class="ml-3 text-gray-300 cursor-pointer select-none">Für den Newsletter anmelden und Videos freischalten</label>
              </div>
            </div>
          {/if}

          <button
            class="block w-full mb-6 px-14 py-4 text-center font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50"
            on:click={isRegistering ? handleSignUp : handleSignIn}
            disabled={loading}
          >
            {#if loading}
              <div class="flex items-center justify-center">
                <div class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-black rounded-full"></div>
                Laden...
              </div>
            {:else}
              {isRegistering ? 'Registrieren' : 'Anmelden'}
            {/if}
          </button>
          
          {#if !isRegistering}
            <button
              class="mb-10 inline-block text-sm text-gray-300 underline hover:text-green-400 transition-colors duration-200"
              on:click={async () => {
                if (!email) {
                  toasts.error('Bitte geben Sie Ihre E-Mail-Adresse ein');
                  return;
                }
                try {
                  loading = true;
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${location.origin}/auth/callback?next=/auth`
                  });
                  if (error) {
                    await handleAuthError(error);
                    return;
                  }
                  toasts.success('Passwort-Reset E-Mail wurde gesendet');
                } catch (error) {
                  toasts.error('Fehler beim Zurücksetzen des Passworts');
                  throw error; // Sentry wird den Fehler automatisch erfassen
                } finally {
                  loading = false;
                }
              }}
              disabled={loading}
            >
              Passwort vergessen?
            </button>
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