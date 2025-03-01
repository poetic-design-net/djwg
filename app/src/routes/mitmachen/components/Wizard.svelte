<script lang="ts">
  import { fade } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { createEventDispatcher } from 'svelte';
  
  import WizardProgress from './WizardProgress.svelte';
  import TypeSelection from './TypeSelection.svelte';
  import BasicInfoForm from './BasicInfoForm.svelte';
  import PackageSelection from './PackageSelection.svelte';
  import AddOnsSelection from './AddOnsSelection.svelte';
  import ReviewSubmit from './ReviewSubmit.svelte';

  import type { 
    SectionData,
    WizardFormData,
    TypeSelectEvent,
    BasicInfoUpdateEvent,
    PackageSelectEvent,
    AddOnsUpdateEvent,
    FormResponse
  } from './types';

  // Props
  export let settings: Record<string, any>;
  export let participatePage: {
    artist: SectionData;
    partner: SectionData;
    manufacturer: SectionData;
  };
  export let form: FormResponse | null = null;
  
  // Event Dispatcher für Formular-Übermittlung
  const dispatch = createEventDispatcher<{
    submit: { formData: WizardFormData };
    typeSelected: TypeSelectEvent;
  }>();
  
  // Wizard-Status
  let currentStep = 0;
  let selectedType: 'artist' | 'aussteller' | 'hersteller' | '' = '';
  let isSubmitting = false;
  
  // Formular-Daten mit Initialwerten
  let formData: WizardFormData = {
    type: '' as 'artist' | 'aussteller' | 'hersteller',
    name: '',
    email: '',
    phone: '',
    message: '',
    // Optional fields initialized as empty strings to prevent undefined
    experience: '',
    instagram: '',
    soundcloud: '',
    website: '',
    company: '',
    industry: '',
    products: '',
    package: '',
    addOns: [],
    accommodation: {
      needed: false,
      persons: 1,
      roomType: 'double'
    }
  };
  
  // Wizard-Steuerung
  function selectType(type: 'artist' | 'aussteller' | 'hersteller') {
    selectedType = type;
    formData.type = type;
    dispatch('typeSelected', { type });
    nextStep();
  }
  
  function nextStep() {
    if (currentStep < getMaxSteps()) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }
  
  function getMaxSteps() {
    if (selectedType === 'artist') return 2;
    if (selectedType === 'aussteller') return 2;
    if (selectedType === 'hersteller') return 4;
    return 1;
  }
  
  // Event-Handler für Komponenten
  function handleTypeSelect(event: CustomEvent<TypeSelectEvent>) {
    selectType(event.detail.type);
  }
  
  function handleBasicInfoUpdate(event: CustomEvent<BasicInfoUpdateEvent>) {
    formData = { ...formData, ...event.detail };
    nextStep();
  }
  
  function handlePackageSelect(event: CustomEvent<PackageSelectEvent>) {
    formData.package = event.detail.package;
    nextStep();
  }
  
  function handleAddOnsUpdate(event: CustomEvent<AddOnsUpdateEvent>) {
    formData.addOns = event.detail.addOns;
    formData.accommodation = event.detail.accommodation;
    nextStep();
  }
  
  function handleSubmission() {
    isSubmitting = true;
    dispatch('submit', { formData });
  }

  // Reset Formular wenn der Server-Response einen Fehler enthält
  $: if (form?.error) {
    isSubmitting = false;
  }
</script>

<!-- Hauptcontainer für den Wizard -->
<div class="bg-gray-900/40 backdrop-blur rounded-3xl p-6 md:p-10">
  <!-- Fortschrittsanzeige anzeigen, wenn nicht beim ersten Schritt -->
  {#if currentStep > 0}
    <WizardProgress 
      currentStep={currentStep} 
      maxSteps={getMaxSteps()} 
    />
  {/if}

  <!-- Formular -->
  <form 
    method="POST"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        await update();
        isSubmitting = false;
      };
    }}
    class="space-y-6" 
    novalidate
  >
    <!-- Versteckte Felder für Formularübermittlung -->
    <input type="hidden" name="type" value={formData.type}>
    
    {#if formData.package}
      <input type="hidden" name="package" value={formData.package}>
    {/if}
    
    {#if formData.addOns && formData.addOns.length > 0}
      {#each formData.addOns as addOn}
        <input type="hidden" name="addOns" value={addOn}>
      {/each}
    {/if}
    
    {#if selectedType === 'hersteller' && formData.accommodation}
      <input type="hidden" name="accommodation_needed" value={formData.accommodation.needed}>
      <input type="hidden" name="accommodation_persons" value={formData.accommodation.persons}>
      <input type="hidden" name="accommodation_roomType" value={formData.accommodation.roomType}>
    {/if}

    <!-- Schritt 0: Type Selection -->
    {#if currentStep === 0}
      <div transition:fade>
        <TypeSelection 
          types={{
            artist: participatePage.artist,
            aussteller: participatePage.partner,
            hersteller: participatePage.manufacturer
          }}
          selectedType={selectedType}
          on:select={handleTypeSelect} 
        />
      </div>
    {/if}

    <!-- Schritt 1: Basic Info Form -->
    {#if currentStep === 1}
      <div transition:fade>
        <BasicInfoForm 
          type={selectedType}
          data={formData}
          artistConfig={{
            experienceLevels: participatePage.artist.experienceLevels || []
          }}
          on:update={handleBasicInfoUpdate}
          on:back={prevStep}
        />
      </div>
    {/if}

    <!-- Schritt 2: Package Selection (nur für Hersteller) -->
    {#if currentStep === 2 && selectedType === 'hersteller'}
      <div transition:fade>
        <PackageSelection 
          packages={participatePage.manufacturer.packages || []}
          selectedPackage={formData.package}
          on:select={handlePackageSelect}
          on:back={prevStep}
        />
      </div>
    {/if}

    <!-- Schritt 3: Add-Ons (nur für Hersteller) -->
    {#if currentStep === 3 && selectedType === 'hersteller'}
      <div transition:fade>
        <AddOnsSelection 
          addOns={participatePage.manufacturer.addOns || []}
          selectedPackage={formData.package}
          selectedAddOns={formData.addOns}
          accommodation={formData.accommodation}
          on:update={handleAddOnsUpdate}
          on:back={prevStep}
        />
      </div>
    {/if}

    <!-- Letzter Schritt: Review & Submit -->
    {#if (currentStep === 2 && (selectedType === 'artist' || selectedType === 'aussteller')) || 
        (currentStep === 4 && selectedType === 'hersteller')}
      <div transition:fade>
        <ReviewSubmit 
          type={selectedType}
          data={formData}
          isSubmitting={isSubmitting}
          on:back={prevStep}
          on:submit={handleSubmission}
        />
      </div>
    {/if}

    <!-- Fehlermeldungen und Erfolgsmeldungen -->
    {#if form?.error}
      <p class="text-red-500 mt-4 text-center" transition:fade>{form.error}</p>
    {/if}

    {#if form?.success}
      <p class="text-green-400 mt-4 text-center" transition:fade>
        {#if selectedType === 'artist'}
          Vielen Dank für deine Bewerbung! Wir melden uns in Kürze bei dir.
        {:else if selectedType === 'aussteller'}
          Vielen Dank für deine Anfrage! Wir melden uns in Kürze bei dir.
        {:else if selectedType === 'hersteller'}
          Vielen Dank für deine Anfrage! Wir melden uns in Kürze mit weiteren Informationen bei dir.
        {/if}
      </p>
    {/if}
  </form>
</div>