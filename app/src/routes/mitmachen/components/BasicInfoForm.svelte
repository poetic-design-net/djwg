<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import FormInput from './FormInput.svelte';
  import FormSelect from './FormSelect.svelte';
  import type { WizardFormData, ExperienceLevel, UserType } from './types';
  
  export let type: UserType;
  export let data: WizardFormData;
  export let artistConfig: {
    experienceLevels: ExperienceLevel[];
  };

  const dispatch = createEventDispatcher<{
    update: WizardFormData;
    back: void;
  }>();

  // Lokale Kopie der Formulardaten
  let formValues = { ...data };

  // Validierung
  let errors: Record<string, string> = {};

  function validateForm(): boolean {
    errors = {};

    // Pflichtfelder für alle
    if (!formValues.name) errors.name = 'Bitte gib deinen Namen ein';
    if (!formValues.email) errors.email = 'Bitte gib deine E-Mail-Adresse ein';
    if (!formValues.message) errors.message = 'Bitte hinterlasse eine Nachricht';

    // Spezifische Validierung
    if (type === 'artist' && !formValues.experience) {
      errors.experience = 'Bitte wähle deine Erfahrung aus';
    }

    if ((type === 'aussteller' || type === 'hersteller') && !formValues.company) {
      errors.company = 'Bitte gib den Firmennamen ein';
    }

    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (validateForm()) {
      dispatch('update', formValues);
    }
  }

  function handleBack() {
    dispatch('back');
  }
</script>

<div class="space-y-6">
  <h2 class="text-2xl text-white font-medium text-center mb-8">
    {#if type === 'artist'}
      Deine Artist-Bewerbung
    {:else if type === 'aussteller'}
      Deine Aussteller-Anfrage
    {:else}
      Deine Hersteller-Anfrage
    {/if}
  </h2>

  <!-- Gemeinsame Felder -->
  <FormInput
    label="Name"
    name="name"
    type="text"
    bind:value={formValues.name}
    required
    error={errors.name}
  />

  <FormInput
    label="E-Mail"
    name="email"
    type="email"
    bind:value={formValues.email}
    required
    error={errors.email}
  />

  <FormInput
    label="Telefon"
    name="phone"
    type="tel"
    bind:value={formValues.phone}
  />

  <!-- Artist-spezifische Felder -->
  {#if type === 'artist'}
    <FormSelect
      label="DJ-Erfahrung"
      name="experience"
      bind:value={formValues.experience}
      options={artistConfig.experienceLevels}
      required
      error={errors.experience}
    />

    <FormInput
      label="Instagram"
      name="instagram"
      type="text"
      bind:value={formValues.instagram}
      placeholder="@deinname"
    />

    <FormInput
      label="SoundCloud"
      name="soundcloud"
      type="text"
      bind:value={formValues.soundcloud}
      placeholder="soundcloud.com/deinname"
    />
  {/if}

  <!-- Aussteller/Hersteller-spezifische Felder -->
  {#if type === 'aussteller' || type === 'hersteller'}
    <FormInput
      label="Website"
      name="website"
      type="text"
      bind:value={formValues.website}
      placeholder="https://"
    />

    <FormInput
      label="Firma"
      name="company"
      type="text"
      bind:value={formValues.company}
      required
      error={errors.company}
    />

    <FormInput
      label="Branche"
      name="industry"
      type="text"
      bind:value={formValues.industry}
    />

    <FormInput
      label="Produkte"
      name="products"
      type="text"
      bind:value={formValues.products}
    />
  {/if}

  <!-- Nachricht -->
  <FormInput
    label="Nachricht"
    name="message"
    type="textarea"
    bind:value={formValues.message}
    required
    error={errors.message}
  />

  <!-- Buttons -->
  <div class="flex justify-between space-x-4 mt-8">
    <button
      type="button"
      class="px-6 py-2 text-gray-300 hover:text-white transition-colors"
      on:click={handleBack}
    >
      Zurück
    </button>

    <button
      type="button"
      class="px-6 py-2 bg-green-400 text-black rounded-full hover:bg-green-300 transition-colors"
      on:click={handleSubmit}
    >
      Weiter
    </button>
  </div>
</div>