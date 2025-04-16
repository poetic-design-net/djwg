<script lang="ts">
  import AuthSignIn from '$lib/components/AuthSignIn.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { subscribeEmailToMailchimp } from '$lib/services/newsletter';
  import type { AuthPageData } from './+page';
  
  export let data: AuthPageData;
  console.log('Auth Page Data:', data);
  
  onMount(() => {
    if (browser) {
      // Process newsletter subscription if needed
      const wantsNewsletter = localStorage.getItem('wants_newsletter') === 'true';
      const userEmail = localStorage.getItem('user_email');
      
      if (wantsNewsletter && userEmail) {
        // Subscribe to newsletter
        subscribeEmailToMailchimp(userEmail)
          .then(() => {
            console.log('Successfully subscribed to newsletter (Google Auth callback)');
          })
          .catch((e) => {
            console.error('Newsletter subscription failed (Google Auth callback):', e);
          })
          .finally(() => {
            // Clean up stored data
            localStorage.removeItem('wants_newsletter');
            localStorage.removeItem('user_email');
          });
      } else {
        // Clean up anyway if no subscription needed
        localStorage.removeItem('wants_newsletter');
        localStorage.removeItem('user_email');
      }
    }
  });
 </script>
 
 <AuthSignIn {data} />