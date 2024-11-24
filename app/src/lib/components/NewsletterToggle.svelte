<script lang="ts">
  import { getContext } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { bentoClient } from '$lib/bento/client';

  export let user;
  export let initialStatus = false;

  const supabase = getContext<SupabaseClient>('supabase');

  let newsletterEnabled = initialStatus;
  let loading = false;
  let successMessage = '';
  let errorMessage = '';

  const handleNewsletterToggle = async () => {
    try {
      loading = true;
      errorMessage = '';
      successMessage = '';

      const newStatus = !newsletterEnabled;

      // Update Bento subscription
      try {
        if (newStatus) {
          await bentoClient.subscribe({
            email: user.email,
            firstName: user.user_metadata?.firstname
          });
        } else {
          await bentoClient.unsubscribe(user.email);
        }

        // Only update Supabase if Bento update was successful
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            newsletter_subscribed: newStatus
          }
        });

        if (updateError) {
          throw new Error('Fehler beim Aktualisieren des Nutzerprofils');
        }

        // Update local state
        newsletterEnabled = newStatus;
        successMessage = newStatus 
          ? 'Newsletter erfolgreich abonniert' 
          : 'Newsletter erfolgreich abbestellt';

      } catch (error) {
        // Log the actual error for debugging
        console.error('Newsletter operation failed:', error);

        // Show user-friendly error message
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Ein unerwarteter Fehler ist aufgetreten';
        }

        // Try to revert any successful changes
        if (newsletterEnabled !== initialStatus) {
          try {
            const { error } = await supabase.auth.updateUser({
              data: {
                newsletter_subscribed: initialStatus
              }
            });
            if (!error) {
              newsletterEnabled = initialStatus;
            }
          } catch (revertError) {
            console.error('Failed to revert user profile:', revertError);
          }
        }
      }
    } finally {
      loading = false;
    }
  };

  // Check initial Bento subscription status
  const checkBentoStatus = async () => {
    try {
      const subscriber = await bentoClient.getSubscriber(user.email);
      if (subscriber && newsletterEnabled !== true) {
        // Update Supabase metadata if Bento shows subscribed but Supabase doesn't
        const { error } = await supabase.auth.updateUser({
          data: {
            newsletter_subscribed: true
          }
        });
        if (!error) {
          newsletterEnabled = true;
        }
      }
    } catch (error) {
      console.error('Error checking Bento status:', error);
      // Don't show error to user as this is a background check
    }
  };

  // Run initial check when component mounts
  $: if (user?.email) {
    checkBentoStatus();
  }
</script>

<div class="flex flex-col items-start space-y-2">
  <button 
    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 {newsletterEnabled ? 'bg-green-500' : 'bg-gray-700'} {loading ? 'opacity-50 cursor-not-allowed' : ''}"
    role="switch"
    aria-checked={newsletterEnabled}
    on:click={handleNewsletterToggle}
    disabled={loading}
  >
    <span 
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {newsletterEnabled ? 'translate-x-5' : 'translate-x-0'}"
    />
  </button>
  {#if loading}
    <p class="text-sm text-gray-400">Wird aktualisiert...</p>
  {/if}
  {#if successMessage}
    <p class="text-sm text-green-500">{successMessage}</p>
  {/if}
  {#if errorMessage}
    <p class="text-sm text-red-500">{errorMessage}</p>
  {/if}
</div>
