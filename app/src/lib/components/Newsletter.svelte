<script lang="ts">
  export let title: string = "Exklusive DJ-Tipps und Tricks. Wöchentlich in deinem Postfach";
  export let description: string = "Schließe dich 10.000 DJs an, erhalte frühzeitig Zugang zu neuen Workshop-Terminen und lerne, wie du deine DJ-Skills auf das nächste Level bringst";

  let email = '';
  let firstName = '';
  let phoneNumber = '';
  let smsConsent = false;
  let loading = false;
  let message = '';
  let isError = false;

  async function handleSubmit(event: Event) {
    event.preventDefault();
    loading = true;
    message = '';
    isError = false;

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          phoneNumber,
          smsConsent,
          tags: ['8331965'], // Adding the tag from Mailchimp form
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message = result.message;
        // Clear form on success
        email = '';
        firstName = '';
        phoneNumber = '';
        smsConsent = false;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      message = error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten';
      isError = true;
    } finally {
      loading = false;
    }
  }
</script>

<div class="container px-4 mx-auto" id="mc_embed_shell">
  <div class="bg-opacity-30 rounded-6xl">
    <div class="md:max-w-2xl mx-auto text-center px-4">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span>
      <h2 class="font-heading mb-6 text-5xl text-white tracking-5xl">{title}</h2>
      <p class="mb-12 text-gray-300 max-w-lg mx-auto">{description}</p>
    </div>
    <div class="px-4" id="mc_embed_signup">
      <form 
        on:submit={handleSubmit}
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        class="validate flex flex-col space-y-4 md:max-w-xl mx-auto"
      >
        <div id="mc_embed_signup_scroll">
          {#if message}
            <div id="mce-responses" class="clear">
              <div 
                class="p-4 rounded-xl text-center {isError ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}" 
                id={isError ? 'mce-error-response' : 'mce-success-response'}
                style="display: block;"
              >
                {message}
              </div>
            </div>
          {/if}

          <!-- Required Fields Notice -->
          <div class="indicates-required text-end text-sm text-gray-400">
            <span class="asterisk text-red-500">*</span> Pflichtfeld
          </div>

          <!-- Email Field -->
          <div class="mc-field-group w-full">
            <label for="mce-EMAIL" class="block text-sm font-medium text-gray-400 mb-2">
              E-Mail Adresse <span class="asterisk text-red-500">*</span>
            </label>
            <div class="border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
              <input 
                type="email" 
                name="EMAIL"
                id="mce-EMAIL"
                bind:value={email}
                required
                class="required email px-6 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
                placeholder="deine@email.de"
              >
            </div>
          </div>

          <!-- Phone Number Field -->
          <div class="mc-field-group w-full">
            <label for="mce-SMSPHONE" class="block text-sm font-medium text-gray-400 mb-2">
              Telefonnummer
            </label>
            <div class="border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl flex">
              <div class="px-4 py-4 border-e border-gray-900 flex items-center">
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
                bind:value={phoneNumber}
                class="px-6 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
                placeholder="+49"
              >
            </div>
            {#if phoneNumber}
              <div class="mc-sms-phone-group mt-2 flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="mc-SMSPHONE-ack"
                  name="mc-SMSPHONE-ack"
                  bind:checked={smsConsent}
                  value="true"
                  class="mt-1.5 h-4 w-4 text-green-500 bg-transparent border-gray-900 rounded focus:ring-green-500"
                >
                <label for="mc-SMSPHONE-ack" class="small-meta text-xs text-gray-400 text-start">
                  DJWorkshop - Durch Angabe deiner Telefonnummer erklärst du dich damit einverstanden, Werbe- und Marketingnachrichten zu erhalten, Benachrichtigungen und Kundenservice-Mitteilungen von DJWorkshop. Möglicherweise fallen Gebühren für Nachrichten und Datenübertragungen an. Die Einwilligung ist keine Bedingung für den Kauf. Die Häufigkeit von Nachrichten kann variieren. Du kannst dich jederzeit abmelden und für weitere Informationen klicken, indem du auf den Link in der Nachricht klickst. Siehe <a href="http://eepurl.com/i4jcm2" target="_blank" class="text-green-400 hover:text-green-300 underline">Nutzungsbedingungen</a>.
                </label>
              </div>
            {/if}
          </div>

          <!-- First Name Field -->
          <div class="mc-field-group w-full">
            <label for="mce-FNAME" class="block text-sm font-medium text-gray-400 mb-2">
              Vorname
            </label>
            <div class="border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
              <input 
                type="text" 
                name="FNAME"
                id="mce-FNAME"
                bind:value={firstName}
                class="text px-6 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" 
                placeholder="Dein Vorname"
              >
            </div>
          </div>

          <!-- Hidden Fields -->
          <div hidden>
            <input type="hidden" name="tags" value="8331965">
          </div>
          <div style="position: absolute; left: -5000px;" aria-hidden="true">
            <input type="text" name="b_0a45dba5a58068d990b9b4e12_7be52bea2f" tabindex="-1" value="">
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            name="subscribe"
            id="mc-embedded-subscribe"
            disabled={loading}
            class="button w-full text-center block px-14 py-4 font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Wird angemeldet...' : 'Abonnieren'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  /* Override any Mailchimp default styles */
  :global(#mc_embed_signup) {
    background: transparent !important;
    font-family: inherit !important;
  }

  :global(#mc_embed_signup form) {
    padding: 0 !important;
  }

  :global(#mc_embed_signup .mc-field-group) {
    width: 100% !important;
    padding-bottom: 20px !important;
    min-height: 0 !important;
  }

  :global(#mce-responses) {
    margin: 0 !important;
    padding: 0 !important;
  }

  :global(#mce-error-response),
  :global(#mce-success-response) {
    margin: 1rem 0 !important;
    padding: 1rem !important;
    border-radius: 1rem !important;
  }
</style>
