<script lang="ts">
  export let email: string = '';
  export let firstName: string = '';
  export let lastName: string = '';
</script>

<div class="relative rounded-3xl p-8 border border-gray-800/40 overflow-hidden">
  <div class="absolute inset-0 mix-blend-overlay "></div>
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
            value={email}
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
            value={firstName}
            class="w-full px-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
        </div>

        <!-- Last Name Field -->
        <div>
          <label for="mce-LNAME" class="block text-sm font-medium text-gray-400 mb-2">
            Nachname
          </label>
          <input
            type="text"
            name="LNAME"
            id="mce-LNAME"
            value={lastName}
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

