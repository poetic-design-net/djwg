<script lang="ts">
  export let email: string = '';
  export let firstName: string = '';
  export let lastName: string = '';
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <!-- Newsletter Anmeldung -->
  <div class="relative rounded-3xl p-8 border border-gray-800/40 overflow-hidden">
    <div class="absolute inset-0 mix-blend-overlay"></div>
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
                />
              </div>
              <input 
                type="text" 
                name="SMSPHONE" 
                id="mce-SMSPHONE"
                class="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div class="mt-2 flex items-start space-x-2">
              <input
                type="checkbox"
                name="mc-SMSPHONE-ack"
                id="mc-SMSPHONE-ack"
                value="true"
                class="mt-1 h-4 w-4 text-green-500 bg-transparent border-gray-800 rounded focus:ring-green-500"
              />
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
            />
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
            />
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
            />
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
          <input type="text" name="b_0a45dba5a58068d990b9b4e12_7be52bea2f" tabindex="-1" value="" />
        </div>

        <!-- Response Messages -->
        <div id="mce-responses" class="mt-4">
          <div id="mce-error-response" class="hidden"></div>
          <div id="mce-success-response" class="hidden"></div>
        </div>
      </form>
    </div>
  </div>

  <!-- WhatsApp Channel -->
  <div class="relative rounded-3xl p-8 border border-gray-800/40 overflow-hidden">
    <div class="absolute inset-0 mix-blend-overlay"></div>
    <div class="relative">
      <h2 class="text-2xl font-medium text-white mb-6">WhatsApp Channel</h2>
      <div class="space-y-6">
        <p class="text-gray-400">
          Trete unserem WhatsApp Channel bei, um keine Updates zu verpassen:
        </p>
        <a 
          href="https://chat.whatsapp.com/DWwQ7Kh038l1OK7T5Dth0v" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-black bg-green-500 hover:bg-green-400 rounded-xl transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Channel beitreten</span>
        </a>
        <p class="text-sm text-gray-400 mt-4">
          Erhalte exklusive Updates und bleib mit der Community in Verbindung.
        </p>
      </div>
    </div>
  </div>
</div>
