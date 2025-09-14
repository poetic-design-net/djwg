<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { TimeSlot } from '$lib/sanity/queries';

  export let eventId: string;
  export let timeSlots: TimeSlot[] = [];
  export let isAdmin = false;
  export let isSecret = false;
  export let user: { id: string; email: string } | null = null;
  export let userProfile: any = null;
  
  // Required badge ID for registration
  const REQUIRED_BADGE_ID = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51';
  
  // Check if user has the required badge
  $: hasRequiredBadge = userProfile?.badges?.some((badge: any) => 
    badge._id === REQUIRED_BADGE_ID || badge._ref === REQUIRED_BADGE_ID
  ) || false;

  let selectedSlot: TimeSlot | null = null;
  let isSubmitting = false;
  let error: string | null = null;
  let success: string | null = null;
  let showLoginPrompt = false;
  
  // Rate limiting
  const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
  let lastBookingAttempt = 0;

  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getAvailableSlots(slot: TimeSlot): number {
    const maxParticipants = slot.maxParticipants || 2; // Default to 2 if not set
    return maxParticipants - (slot.bookings?.length || 0);
  }

  function isSlotAvailable(slot: TimeSlot): boolean {
    return !slot.isBlocked && getAvailableSlots(slot) > 0;
  }

  function isRateLimited(): boolean {
    const now = Date.now();
    if (now - lastBookingAttempt < RATE_LIMIT_WINDOW) {
      return true;
    }
    return false;
  }

  async function handleBooking() {
    if (!selectedSlot) return;
    
    // Check if user is logged in
    if (!user || !userProfile) {
      showLoginPrompt = true;
      return;
    }
    
    // Check if user has required badge
    if (!hasRequiredBadge) {
      error = 'Du benötigst den "Event-Teilnehmer" Badge um dich anzumelden. Bitte schließe zuerst dein Profil ab.';
      return;
    }

    if (isRateLimited()) {
      error = 'Zu viele Buchungsversuche. Bitte warte eine Stunde, bevor du es erneut versuchst.';
      return;
    }

    isSubmitting = true;
    error = null;
    success = null;
    lastBookingAttempt = Date.now();

    try {
      const booking = {
        name: userProfile.displayName || userProfile.username || user.email.split('@')[0],
        email: user.email,
        userId: user.id,
        profileId: userProfile.id,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          booking,
          eventId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      success = 'Dein Slot wurde erfolgreich gebucht!';
      selectedSlot = null;

      // Update time slots from the server response
      timeSlots = result.data;
    } catch (e: any) {
      error = e.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
      console.error('Booking error:', e);
    } finally {
      isSubmitting = false;
    }
  }

  async function toggleBlockSlot(slot: TimeSlot) {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/bookings/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: slot._id,
          isBlocked: !slot.isBlocked,
          eventId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      // Update time slots from the server response
      timeSlots = result.data;
    } catch (e) {
      console.error('Error toggling slot block:', e);
    }
  }
</script>

<div class="py-20 bg-black/40 items-center flex justify-center">
  <div class="container mx-auto px-4">
    <div class="relative">
      {#if isSecret && !isAdmin}
        <div class="absolute inset-0 backdrop-blur-xl bg-black/40 z-10 flex items-center justify-center">
          <div class="text-center">
            <h2 class="mb-4 font-heading text-5xl md:text-6xl text-white tracking-tighter ">Open Stage </h2>
            <span class=" text-white font-medium"> wird bald freigeschaltet</span>
            <p class="text-gray-400 mt-2">Bleib gespannt!</p>
          </div>
        </div>
      {/if}

      <div class="text-center mb-16">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Open Stage</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter mb-6">Buche deinen Slot</h2>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Sichere dir einen der begehrten Slots für die Open Stage. Pro Zeitfenster können sich maximal zwei DJs anmelden.
        </p>
      </div>

      <!-- Time Slots Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {#each timeSlots as slot}
          <div 
            class="p-6 bg-black/40 border rounded-3xl transition-all duration-300 {
              slot.isBlocked ? 'border-red-500/50' :
              isSlotAvailable(slot) ? 'border-gray-800 hover:border-green-500' : 'border-yellow-500/50'
            }"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl text-white mb-1">{formatTime(slot.startTime)}</h3>
                <p class="text-sm text-gray-400">{formatDate(slot.startTime)}</p>
              </div>
              <div class="text-right">
                <span class="text-sm {
                  slot.isBlocked ? 'text-red-400' :
                  isSlotAvailable(slot) ? 'text-green-400' : 'text-yellow-400'
                }">
                  {#if slot.isBlocked}
                    Gesperrt
                  {:else}
                    {getAvailableSlots(slot)} {getAvailableSlots(slot) === 1 ? 'Platz' : 'Plätze'} frei
                  {/if}
                </span>
              </div>
            </div>

            {#if slot.bookings?.length}
              <div class="mb-4">
                <p class="text-sm text-gray-400 mb-2">Gebuchte Slots:</p>
                {#each slot.bookings as booking}
                  <div class="text-sm text-white">{booking.name}</div>
                {/each}
              </div>
            {/if}

            <div class="flex justify-between items-center">
              {#if isAdmin}
                <button
                  class="px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 {
                    slot.isBlocked ? 
                    'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 
                    'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }"
                  on:click={() => toggleBlockSlot(slot)}
                >
                  {slot.isBlocked ? 'Entsperren' : 'Sperren'}
                </button>
              {/if}

              {#if !slot.isBlocked && isSlotAvailable(slot)}
                <button
                  class="px-4 py-2 text-sm font-medium bg-green-400 text-black rounded-full hover:bg-green-500 transition-colors duration-200 ml-auto"
                  on:click={() => {
                    if (!user) {
                      showLoginPrompt = true;
                    } else {
                      selectedSlot = slot;
                    }
                  }}
                >
                  Jetzt buchen
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Booking Confirmation Modal -->
  {#if selectedSlot && user}
    <div 
      class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      transition:fade={{ duration: 200 }}
      on:click|self={() => selectedSlot = null}
    >
      <div 
        class="w-full max-w-md bg-black border border-gray-800 rounded-3xl p-8"
        transition:slide={{ duration: 200, easing: quintOut }}
      >
        <h3 class="text-2xl text-white mb-6">Slot buchen für {formatTime(selectedSlot.startTime)}</h3>
        
        <div class="space-y-6">
          <div class="bg-black/40 border border-gray-800 rounded-xl p-4">
            <p class="text-sm text-gray-400 mb-2">Du buchst als:</p>
            <p class="text-white font-medium">
              {userProfile?.displayName || userProfile?.username || user.email.split('@')[0]}
            </p>
            <p class="text-sm text-gray-400 mt-1">{user.email}</p>
          </div>

          {#if error}
            <p class="text-red-400 text-sm">{error}</p>
          {/if}

          {#if success}
            <p class="text-green-400 text-sm">{success}</p>
          {/if}

          <div class="flex space-x-4">
            <button
              type="button"
              class="flex-1 px-6 py-3 text-white border border-gray-800 rounded-xl hover:border-gray-700 transition-colors duration-200"
              on:click={() => selectedSlot = null}
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button
              on:click={handleBooking}
              class="flex-1 px-6 py-3 {hasRequiredBadge ? 'bg-green-400 hover:bg-green-500' : 'bg-gray-600 hover:bg-gray-700'} text-black rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !hasRequiredBadge}
              title={!hasRequiredBadge ? 'Badge erforderlich' : ''}
            >
              {#if !hasRequiredBadge}
                🔒 Badge erforderlich
              {:else if isSubmitting}
                Wird gebucht...
              {:else}
                Slot buchen
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Login Prompt Modal -->
  {#if showLoginPrompt}
    <div 
      class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      transition:fade={{ duration: 200 }}
      on:click|self={() => showLoginPrompt = false}
    >
      <div 
        class="w-full max-w-md bg-black border border-gray-800 rounded-3xl p-8"
        transition:slide={{ duration: 200, easing: quintOut }}
      >
        <h3 class="text-2xl text-white mb-4">Anmeldung erforderlich</h3>
        <p class="text-gray-300 mb-6">
          Um einen Slot zu buchen, musst du dich zuerst anmelden oder registrieren.
        </p>
        
        <div class="flex space-x-4">
          <button
            type="button"
            class="flex-1 px-6 py-3 text-white border border-gray-800 rounded-xl hover:border-gray-700 transition-colors duration-200"
            on:click={() => showLoginPrompt = false}
          >
            Abbrechen
          </button>
          <a
            href="/auth?next={encodeURIComponent(window.location.pathname)}"
            class="flex-1 px-6 py-3 bg-green-400 text-black rounded-xl hover:bg-green-500 transition-colors duration-200 text-center"
          >
            Jetzt anmelden
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>
