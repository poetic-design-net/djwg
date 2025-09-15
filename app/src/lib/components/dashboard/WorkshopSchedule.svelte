<script lang="ts">
  import { onMount } from 'svelte';
  import groq from 'groq';
  import { client } from '$lib/sanity/client';
  import { createEventDispatcher } from 'svelte';
  import { getImageUrl } from '$lib/sanity/image';
  import CountdownTimer from '$lib/components/event/CountdownTimer.svelte';
  import { toasts } from '$lib/stores/toast';

  export let userId: string;
  export let userProfile: any = null;
  export let user: any = null; // User object from Supabase with badges
  export let isAdmin: boolean = false;

  // Mobile detection
  let showFilterDropdown = false;

  // Track countdown completion
  let countdownCompleted: Set<string> = new Set();

  // Track loading states for each registration
  let registrationLoading: Map<string, boolean> = new Map();
  let cancellationLoading: Map<string, boolean> = new Map();

  // Global registration open state for non-admins
  let globalRegistrationOpen = false;

  // Global registration start time - will be calculated from events
  let globalRegistrationStart: string | null = null;

  const dispatch = createEventDispatcher();

  // Required badge ID for registration - using supabaseId from Sanity
  const REQUIRED_BADGE_ID = '319b8937-cc53-4b1c-a2ef-b9f97aa81f51'; // supabaseId of Workshop/Partner badge

  // Check if user has the required badge
  $: hasRequiredBadge = (() => {
    // First check in user.badges (from Supabase) - these have badge_id field
    if (user?.badges && Array.isArray(user.badges)) {
      const hasBadge = user.badges.some((badge: any) => {
        return badge.badge_id === REQUIRED_BADGE_ID;
      });
      if (hasBadge) return true;
    }

    // Fallback to profile badges if available
    const badges = userProfile?.awardedBadges || userProfile?.badges || [];
    if (badges.length > 0) {
      const hasBadge = badges.some((badge: any) => {
        // Handle different badge structures
        const badgeId = typeof badge === 'string' ? badge :
                        badge._id || badge._ref || badge.supabaseId || badge.id || badge;
        // Check both IDs (supabaseId and Sanity _id)
        return badgeId === REQUIRED_BADGE_ID || badgeId === '3eade88a-8d15-4dc6-b0b8-df334105a1b2';
      });
      if (hasBadge) return true;
    }

    return false;
  })();

  interface Artist {
    _id?: string;
    name: string;
    role?: string;
    image?: string;
    soundcloud?: string;
    instagram?: string;
  }

  interface ScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: Artist;
    instructors?: Artist[];
    instructorDisplayMode?: 'all' | 'b2b' | 'vs' | 'comma' | 'ampersand' | 'main';
    icon?: string;
    maxParticipants?: number;
    currentParticipants?: number;
    type?: 'workshop' | 'openspace' | 'other';
    allowRegistration?: boolean;
    registrationStartTime?: string;
    maxRegistrations?: number;
    registrationRequired?: boolean;
    currentRegistrations?: number;
    isOpenTable?: boolean;
    openTableSettings?: {
      autoAcceptRegistrations?: boolean;
      showRemainingSlots?: boolean;
      waitlistEnabled?: boolean;
      description?: string;
    };
  }

  interface Stage {
    name: string;
    description: string;
    schedule: ScheduleItem[];
  }

  interface Day {
    date: string;
    stages: Stage[];
  }

  interface Event {
    _id: string;
    title: string;
    slug: { current: string };
    date: string;
    location?: string;
    schedule?: Day[];
    hasOpenStage?: boolean;
  }

  interface TimeSlot {
    _id: string;
    startTime: string;
    endTime: string;
    maxParticipants?: number;
    isBlocked?: boolean;
    bookings?: any[];
    event?: {
      _ref: string;
    };
  }

  interface Registration {
    eventId: string;
    sessionTitle: string;
    dayIndex: number;
    stageIndex: number;
    itemIndex: number;
  }

  let events: Event[] = [];
  let openStageSlots: TimeSlot[] = [];
  let userRegistrations: Registration[] = [];
  let isLoading = true;
  let error: string | null = null;
  let filter: 'all' | 'workshop' | 'openspace' = 'all';
  let expandedDays = new Set<string>();

  onMount(() => {
    loadEvents();
    loadUserRegistrations();
    loadOpenStageSlots();
  });

  async function loadEvents() {
    try {
      isLoading = true;
      error = null;

      // First, let's check if there are any eventSchedule documents at all
      const scheduleCheckQuery = groq`*[_type == "eventSchedule"] {
        _id,
        "eventId": event._ref,
        "eventTitle": event->title
      }`;

      const schedules = await client.fetch(scheduleCheckQuery);

      // Fetch events with schedule data (checking both embedded and referenced schedules)
      const query = groq`*[_type == "event"] {
        _id,
        title,
        slug,
        date,
        location,
        hasOpenStage,
        // Try to get referenced eventSchedule first
        "schedule": coalesce(
          *[_type == "eventSchedule" && references(^._id)][0] {
            _id,
            isSecret,
            days[] {
              "date": date,
              stages[] {
                name,
                description,
                schedule[] {
                  _key,
                  time,
                  title,
                  description,
                  type,
                  icon,
                  instructor-> {
                    name,
                    role,
                    image {
                      asset->,
                      hotspot
                    },
                    soundcloud,
                    instagram
                  },
                  instructors[]-> {
                    _id,
                    name,
                    role,
                    image {
                      asset->,
                      hotspot
                    },
                    soundcloud,
                    instagram
                  },
                  instructorDisplayMode,
                  allowRegistration,
                  registrationStartTime,
                  maxRegistrations,
                  registrationRequired,
                  currentRegistrations,
                  isOpenTable,
                  openTableSettings {
                    autoAcceptRegistrations,
                    showRemainingSlots,
                    waitlistEnabled,
                    description
                  }
                }
              }
            }
          },
          // Fall back to embedded schedule if it exists
          schedule {
            _id,
            isSecret,
            days[] {
              "date": date,
              stages[] {
                name,
                description,
                schedule[] {
                  _key,
                  time,
                  title,
                  description,
                  type,
                  icon,
                  instructor-> {
                    name,
                    role,
                    image {
                      asset->,
                      hotspot
                    },
                    soundcloud,
                    instagram
                  },
                  instructors[]-> {
                    _id,
                    name,
                    role,
                    image {
                      asset->,
                      hotspot
                    },
                    soundcloud,
                    instagram
                  },
                  instructorDisplayMode,
                  allowRegistration,
                  registrationStartTime,
                  maxRegistrations,
                  registrationRequired,
                  currentRegistrations,
                  isOpenTable,
                  openTableSettings {
                    autoAcceptRegistrations,
                    showRemainingSlots,
                    waitlistEnabled,
                    description
                  }
                }
              }
            }
          }
        )
      } | order(date asc)`;

      const data = await client.fetch(query);

      // Filter only events that have schedule data
      // Also filter out secret schedules for non-admins
      events = (data || []).filter(e => {
        // Must have schedule data
        if (!e.schedule || !e.schedule.days || e.schedule.days.length === 0) {
          return false;
        }
        // If schedule is secret and user is not admin, hide it
        if (e.schedule.isSecret && !isAdmin) {
          return false;
        }
        return true;
      });

      // Find the earliest registration start time from all sessions
      let earliestStartTime: Date | null = null;
      events.forEach(event => {
        if (event.schedule?.days) {
          event.schedule.days.forEach((day: any) => {
            day.stages?.forEach((stage: any) => {
              stage.schedule?.forEach((item: any) => {
                if (item.registrationStartTime) {
                  const startTime = new Date(item.registrationStartTime);
                  if (!earliestStartTime || startTime < earliestStartTime) {
                    earliestStartTime = startTime;
                  }
                }
              });
            });
          });
        }
      });

      // For now, always set registration to open in the future for testing
      // This ensures the countdown is always visible
      const daysUntilRegistration = 5; // Set to open in 5 days
      globalRegistrationStart = new Date(Date.now() + daysUntilRegistration * 24 * 60 * 60 * 1000).toISOString();
      console.log('Registration will open on:', globalRegistrationStart);

      // Original logic (commented out for testing)
      /*
      if (earliestStartTime) {
        globalRegistrationStart = earliestStartTime.toISOString();
        console.log('Found earliest registration time:', globalRegistrationStart);
      } else {
        // Fallback: if no registration times found, use the first event date
        const firstEventDate = events[0]?.date;
        if (firstEventDate) {
          // Set registration to open 1 week before event
          const eventDate = new Date(firstEventDate);
          eventDate.setDate(eventDate.getDate() - 7);
          globalRegistrationStart = eventDate.toISOString();
          console.log('Using event date minus 1 week:', globalRegistrationStart);
        } else {
          // Ultimate fallback - set to 7 days from now for testing
          globalRegistrationStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week from now
          console.log('Using fallback (7 days from now):', globalRegistrationStart);
        }
      }
      */

      // Check if global registration is already open
      globalRegistrationOpen = globalRegistrationStart ? new Date() >= new Date(globalRegistrationStart) : false;
      console.log('Registration open?', globalRegistrationOpen, 'Current time:', new Date().toISOString());

    } catch (err) {
      console.error('Error loading events:', err);
      error = 'Fehler beim Laden der Workshops';
    } finally {
      isLoading = false;
    }
  }

  async function loadUserRegistrations() {
    try {
      const query = groq`*[_type == "scheduleRegistration" && userId == $userId && status != "cancelled"] {
        "eventId": event->_id,
        sessionTitle,
        dayIndex,
        stageIndex,
        itemIndex
      }`;

      const data = await client.fetch(query, { userId });
      userRegistrations = data || [];
    } catch (err) {
      console.error('Error loading user registrations:', err);
    }
  }

  async function loadOpenStageSlots() {
    try {
      // Load all Open Stage time slots
      const query = groq`*[_type == "timeSlot"] | order(startTime asc) {
        _id,
        startTime,
        endTime,
        maxParticipants,
        isBlocked,
        bookings,
        event {
          _ref
        }
      }`;

      const data = await client.fetch(query);
      openStageSlots = data || [];
    } catch (err) {
      console.error('Error loading Open Stage slots:', err);
    }
  }

  function isRegistered(eventId: string, dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    return userRegistrations.some(reg =>
      reg.eventId === eventId &&
      reg.dayIndex === dayIndex &&
      reg.stageIndex === stageIndex &&
      reg.itemIndex === itemIndex
    );
  }

  // Check if registration is open for a session
  function isRegistrationOpen(item: ScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    if (!item.registrationStartTime) {
      return true;
    }

    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    if (countdownCompleted.has(key)) {
      return true;
    }

    const now = new Date().getTime();
    const startTime = new Date(item.registrationStartTime).getTime();

    if (now >= startTime) {
      countdownCompleted.add(key);
      countdownCompleted = new Set(countdownCompleted);
      return true;
    }

    return false;
  }

  // Handle countdown completion
  function handleCountdownComplete(dayIndex: number, stageIndex: number, itemIndex: number) {
    const key = `${dayIndex}-${stageIndex}-${itemIndex}`;
    countdownCompleted.add(key);
    countdownCompleted = new Set(countdownCompleted);
  }

  async function registerForSession(event: Event, session: ScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number, slotId?: string) {
    const loadingKey = `${event._id}-${dayIndex}-${stageIndex}-${itemIndex}`;

    try {
      // Check if user has required badge
      if (!hasRequiredBadge) {
        toasts.error('Du benötigst den "Event-Teilnehmer" Badge um dich anzumelden. Bitte schließe zuerst dein Profil ab.');
        return;
      }

      // Check if this is an Open Stage slot
      if (slotId && dayIndex === -1) {
        // For Open Stage, we need to register differently
        // This would need to use the booking API endpoint
        toasts.info('Open Stage Anmeldung ist in Entwicklung. Bitte nutze die Event-Detail-Seite.');
        return;
      }

      // Set loading state
      registrationLoading.set(loadingKey, true);
      registrationLoading = new Map(registrationLoading);

      const registration = {
        userId,
        eventId: event._id,
        eventTitle: event.title,
        sessionTitle: session.title,
        sessionTime: session.time,
        dayIndex,
        stageIndex,
        itemIndex,
        status: 'confirmed'
      };

      const response = await fetch('/api/schedule-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('bereits angemeldet')) {
          toasts.warning('Du bist bereits für diese Session angemeldet.');
        } else {
          throw new Error(errorData.error || 'Registration failed');
        }
        return;
      }

      // Update registrations immediately
      await loadUserRegistrations();

      // Show success toast
      toasts.success(`Erfolgreich für "${session.title}" angemeldet!`);

      dispatch('registered', { event, session });

    } catch (err) {
      console.error('Error registering:', err);
      toasts.error('Fehler bei der Anmeldung. Bitte versuche es erneut.');
    } finally {
      // Remove loading state
      registrationLoading.delete(loadingKey);
      registrationLoading = new Map(registrationLoading);
    }
  }

  async function cancelRegistration(eventId: string, dayIndex: number, stageIndex: number, itemIndex: number) {
    const loadingKey = `${eventId}-${dayIndex}-${stageIndex}-${itemIndex}`;

    try {
      const registration = userRegistrations.find(reg =>
        reg.eventId === eventId &&
        reg.dayIndex === dayIndex &&
        reg.stageIndex === stageIndex &&
        reg.itemIndex === itemIndex
      );

      if (!registration) {
        toasts.error('Registrierung nicht gefunden.');
        return;
      }

      // Set loading state
      cancellationLoading.set(loadingKey, true);
      cancellationLoading = new Map(cancellationLoading);

      // Call DELETE endpoint to cancel registration
      const response = await fetch('/api/schedule-registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          dayIndex,
          stageIndex,
          itemIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cancellation failed');
      }

      // Update registrations immediately
      await loadUserRegistrations();

      // Show success toast
      toasts.success('Erfolgreich abgemeldet!');

    } catch (err) {
      console.error('Error cancelling registration:', err);
      toasts.error('Fehler beim Abmelden. Bitte versuche es erneut.');
    } finally {
      // Remove loading state
      cancellationLoading.delete(loadingKey);
      cancellationLoading = new Map(cancellationLoading);
    }
  }

  function toggleDayExpanded(dayKey: string) {
    if (expandedDays.has(dayKey)) {
      expandedDays.delete(dayKey);
    } else {
      expandedDays.add(dayKey);
    }
    expandedDays = new Set(expandedDays);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function getAllArtists(item: ScheduleItem): Artist[] {
    const artists: Artist[] = [];
    if (item.instructors && Array.isArray(item.instructors) && item.instructors.length > 0) {
      artists.push(...item.instructors);
    } else if (item.instructor) {
      artists.push(item.instructor);
    }
    return artists;
  }

  function formatArtistNames(item: ScheduleItem): string {
    const artists = getAllArtists(item);
    if (artists.length === 0) return '';

    const names = artists.map(a => a.name);
    const mode = item.instructorDisplayMode || 'all';

    switch (mode) {
      case 'b2b':
        return names.join(' b2b ');
      case 'vs':
        return names.join(' vs ');
      case 'comma':
        return names.join(', ');
      case 'ampersand':
        return names.join(' & ');
      case 'main':
        return names[0];
      case 'all':
      default:
        if (names.length === 2) {
          return names.join(' & ');
        }
        return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
    }
  }

  function getAvailableSpots(session: ScheduleItem): string {
    // Check both maxParticipants and maxRegistrations
    const maxSpots = session.maxParticipants || session.maxRegistrations;
    const currentSpots = session.currentParticipants || session.currentRegistrations || 0;

    if (!maxSpots) return '';

    const available = maxSpots - currentSpots;
    if (available <= 0) return 'Ausgebucht';
    if (available <= 5) return `Nur noch ${available} Plätze`;
    return `${available} Plätze frei`;
  }

  function isWorkshopOrOpenSpace(item: ScheduleItem): boolean {
    // Show items where allowRegistration OR isOpenTable is true
    // Open Space sessions might use isOpenTable instead of allowRegistration
    const hasRegistration = item.allowRegistration === true || item.isOpenTable === true;

    // Check registration capability

    return hasRegistration;
  }

  function getSessionType(item: ScheduleItem): 'workshop' | 'openspace' | 'other' {
    // Use the type field from Sanity if available
    if (item.type) {
      return item.type;
    }

    // Check if it's an Open Table (Open Space) session
    if (item.isOpenTable === true) {
      return 'openspace';
    }

    // Try to detect from title as fallback
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('open space') || titleLower.includes('openspace') || titleLower.includes('open table')) {
      return 'openspace';
    }

    // Default to workshop for all registrable sessions
    return 'workshop';
  }

  function getSessionTypeLabel(type: 'workshop' | 'openspace' | 'other'): string {
    switch (type) {
      case 'workshop': return 'Workshop';
      case 'openspace': return 'Open Space';
      default: return 'Session';
    }
  }

  function getSessionTypeColor(type: 'workshop' | 'openspace' | 'other'): string {
    switch (type) {
      case 'workshop': return 'bg-blue-500/20 text-blue-400';
      case 'openspace': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  // Convert Open Stage time slots to session format
  function convertOpenStageToSessions(slots: TimeSlot[], events: Event[]) {
    return slots.map(slot => {
      // Find the event this slot belongs to
      const event = events.find(e => e._id === slot.event?._ref);
      if (!event) return null;

      // Create a pseudo-schedule item from the time slot
      const item: ScheduleItem = {
        time: `${new Date(slot.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.endTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
        title: 'Open Stage Slot',
        description: `Verfügbare Plätze: ${(slot.maxParticipants || 2) - (slot.bookings?.length || 0)} von ${slot.maxParticipants || 2}`,
        type: 'openspace',
        allowRegistration: !slot.isBlocked && ((slot.maxParticipants || 2) - (slot.bookings?.length || 0)) > 0,
        maxParticipants: slot.maxParticipants || 2,
        currentParticipants: slot.bookings?.length || 0,
        isOpenTable: true
      };

      // Create a pseudo-day from the slot date
      const slotDate = new Date(slot.startTime);
      const day = {
        date: slotDate.toISOString().split('T')[0],
        stages: [{
          name: 'Open Stage',
          description: 'Open Stage Performance Slots',
          schedule: [item]
        }]
      };

      return {
        event,
        day,
        dayIndex: -1, // Special index for Open Stage
        stage: day.stages[0],
        stageIndex: 0,
        item,
        itemIndex: 0,
        type: 'openspace' as const,
        slotId: slot._id // Keep reference to original slot
      };
    }).filter(Boolean);
  }

  // Get all workshop and open space sessions from all events
  $: allSessions = (() => {
    // Regular schedule sessions
    const regularSessions = events.flatMap(event => {
      // Secret schedules are already filtered out at event level
      if (!event.schedule || !event.schedule.days) {
        return [];
      }

      const sessions = event.schedule.days.flatMap((day, dayIndex) =>
        day.stages.flatMap((stage, stageIndex) =>
          stage.schedule
            .filter(isWorkshopOrOpenSpace)
            .map((item, itemIndex) => ({
              event,
              day,
              dayIndex,
              stage,
              stageIndex,
              item,
              itemIndex,
              type: getSessionType(item)
            }))
        )
      );

      return sessions;
    });

    // Open Stage time slots converted to sessions
    const openStageSessions = convertOpenStageToSessions(openStageSlots, events);

    const combined = [...regularSessions, ...openStageSessions];
    return combined;
  })();

  // Filter sessions based on selected filter
  $: filteredSessions = filter === 'all'
    ? allSessions
    : allSessions.filter(s => s.type === filter);

  // Track session stats
  $: sessionStats = {
    total: allSessions.length,
    filtered: filteredSessions.length,
    workshops: allSessions.filter(s => s.type === 'workshop').length,
    openspace: allSessions.filter(s => s.type === 'openspace').length
  };

  // Group sessions by date
  $: sessionsByDate = filteredSessions.reduce((acc, session) => {
    const dateKey = session.day.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, typeof filteredSessions>);

  // Sort dates
  $: sortedDates = Object.keys(sessionsByDate).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

</script>

<div class="bg-black/40 border border-gray-800 rounded-3xl p-4 sm:p-6">
  {#if !isAdmin && !globalRegistrationOpen && globalRegistrationStart}
    <!-- Countdown Banner for non-admin users -->
    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
      <div class="text-center">
        <h3 class="text-xl font-heading text-yellow-400 mb-4">Registrierung öffnet bald!</h3>
        <!-- Debug info -->
        {#if false}
          <div class="text-xs text-gray-500 mb-2">
            Debug: Target={globalRegistrationStart}, Now={new Date().toISOString()}
          </div>
        {/if}
        <CountdownTimer
          targetDate={globalRegistrationStart || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
          label="Anmeldung möglich in"
          completedLabel="Registrierung ist jetzt geöffnet!"
          showSeconds={true}
          compact={false}
          onComplete={() => {
            globalRegistrationOpen = true;
          }}
        />
        <p class="text-sm text-gray-400 mt-4">Du kannst dir bereits alle verfügbaren Sessions ansehen</p>
      </div>
    </div>
  {/if}

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl sm:text-2xl font-heading text-white mb-2">Event Schedule</h2>
        <p class="text-sm sm:text-base text-gray-400">
          {#if !isAdmin && !globalRegistrationOpen}
            Durchstöbere die Sessions
          {:else}
            Melde dich für Sessions an
          {/if}
        </p>
        {#if events.length > 0}
          <p class="text-xs text-gray-500 mt-1">
            {events.length} Events geladen, {allSessions.length} Sessions gefunden
          </p>
        {/if}
      </div>

      <!-- Filter Dropdown for Mobile -->
      <div class="relative">
        <!-- Mobile Dropdown Button -->
        <button
          on:click={() => showFilterDropdown = !showFilterDropdown}
          class="sm:hidden w-full px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-between
            {filter === 'all' ? 'bg-green-500 text-black' : filter === 'workshop' ? 'bg-blue-500 text-white' : filter === 'openspace' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}"
        >
          <span>
            {filter === 'all' ? 'Alle Sessions' : filter === 'workshop' ? 'Workshops' : 'Open Space'}
          </span>
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <!-- Mobile Dropdown Menu -->
        {#if showFilterDropdown}
          <div class="sm:hidden absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
            <button
              on:click={() => { filter = 'all'; showFilterDropdown = false; }}
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors
                {filter === 'all' ? 'bg-gray-800 text-green-400' : 'text-gray-400'}"
            >
              Alle Sessions
            </button>
            <button
              on:click={() => { filter = 'workshop'; showFilterDropdown = false; }}
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors
                {filter === 'workshop' ? 'bg-gray-800 text-blue-400' : 'text-gray-400'}"
            >
              Workshops
            </button>
            <button
              on:click={() => { filter = 'openspace'; showFilterDropdown = false; }}
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors
                {filter === 'openspace' ? 'bg-gray-800 text-purple-400' : 'text-gray-400'}"
            >
              Open Space
            </button>
          </div>
        {/if}

        <!-- Desktop Filter Buttons -->
        <div class="hidden sm:flex gap-2">
          <button
            on:click={() => filter = 'all'}
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              {filter === 'all' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          >
            Alle Sessions
          </button>
          <button
            on:click={() => filter = 'workshop'}
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              {filter === 'workshop' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          >
            Workshops
          </button>
          <button
            on:click={() => filter = 'openspace'}
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
              {filter === 'openspace' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          >
            Open Space
          </button>
        </div>
      </div>
    </div>

  <!-- Content -->
  {#if isLoading}
    <div class="flex items-center justify-center py-12">
      <div class="text-gray-400">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Lade Workshop Schedule...
      </div>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-red-400">{error}</p>
      <button
        on:click={loadEvents}
        class="mt-4 px-4 py-2 bg-green-500 text-black rounded-full hover:bg-green-600 transition-colors duration-200"
      >
        Erneut versuchen
      </button>
    </div>
  {:else if sortedDates.length === 0}
    <div class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
      </svg>
      <p class="text-gray-400 mb-2">
        {filter === 'all' ? 'Keine Sessions im Schedule gefunden' :
         filter === 'workshop' ? 'Keine Workshops verfügbar' : 'Keine Open Space Sessions verfügbar'}
      </p>
      {#if events.length > 0}
        <p class="text-xs text-gray-500 mt-2">
          Es wurden {events.length} Events gefunden, aber keine haben Schedule-Daten.
        </p>
      {:else}
        <p class="text-xs text-gray-500 mt-2">
          Es wurden keine kommenden Events mit Schedule gefunden.
        </p>
      {/if}
    </div>
  {:else}
    <!-- Sessions List -->
    <div class="space-y-4 sm:space-y-6">
      {#each sortedDates as date}
        {@const sessions = sessionsByDate[date]}
        {@const dayKey = date}
        {@const isExpanded = expandedDays.has(dayKey)}

        <div class="bg-black/20 border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden">
          <!-- Day Header -->
          <div
            class="p-4 cursor-pointer hover:bg-gray-900/50 transition-colors duration-200"
            on:click={() => toggleDayExpanded(dayKey)}
            on:keydown={(e) => e.key === 'Enter' && toggleDayExpanded(dayKey)}
            role="button"
            tabindex="0"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 class="text-xl font-medium text-white">{formatDate(date)}</h3>
                <span class="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                  {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
                </span>
              </div>

              <svg
                class="w-5 h-5 text-gray-400 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <!-- Expanded Sessions -->
          {#if isExpanded}
            <div class="border-t border-gray-800 p-4 space-y-3">
              {#each sessions as session}
                {@const registered = isRegistered(session.event._id, session.dayIndex, session.stageIndex, session.itemIndex)}
                {@const availableSpots = getAvailableSpots(session.item)}
                {@const isFull = availableSpots === 'Ausgebucht'}
                {@const artists = getAllArtists(session.item)}
                {@const loadingKey = `${session.event._id}-${session.dayIndex}-${session.stageIndex}-${session.itemIndex}`}
                {@const isRegistering = registrationLoading.get(loadingKey) || false}
                {@const isCancelling = cancellationLoading.get(loadingKey) || false}

                <div class="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors duration-200">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <!-- Session Header -->
                      <div class="flex items-start gap-3 mb-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getSessionTypeColor(session.type)}">
                          {getSessionTypeLabel(session.type)}
                        </span>
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <h4 class="text-lg font-medium text-white">{session.item.title}</h4>
                            {#if !isRegistrationOpen(session.item, session.dayIndex, session.stageIndex, session.itemIndex) && session.item.registrationStartTime}
                              <span class="text-yellow-400" title="Registrierung öffnet bald">
                                <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              </span>
                            {/if}
                          </div>
                          {#if session.item.description}
                            <p class="text-sm text-gray-400 mt-1">{session.item.description}</p>
                          {/if}
                        </div>
                      </div>

                      <!-- Session Details -->
                      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-3">
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          {session.item.time}
                        </span>
                        <span class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {session.stage.name}
                        </span>
                        {#if availableSpots}
                          <span class="{isFull ? 'text-red-400' : availableSpots.includes('Nur noch') ? 'text-yellow-400' : 'text-gray-400'}">
                            {availableSpots}
                          </span>
                        {/if}
                      </div>

                      <!-- Instructors -->
                      {#if artists.length > 0}
                        <div class="flex items-center gap-2 mb-3">
                          <span class="text-sm text-gray-500">Mit:</span>
                          <span class="text-sm text-green-400">{formatArtistNames(session.item)}</span>
                        </div>
                      {/if}
                    </div>

                    <!-- Registration Button -->
                    <div class="flex-shrink-0">
                      {#if registered}
                        <button
                          on:click={() => cancelRegistration(session.event._id, session.dayIndex, session.stageIndex, session.itemIndex)}
                          class="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={isCancelling}
                        >
                          {#if isCancelling}
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wird abgemeldet...
                          {:else}
                            Abmelden
                          {/if}
                        </button>
                      {:else if isFull}
                        <span class="px-4 py-2 bg-gray-800 text-gray-500 text-sm rounded-lg cursor-not-allowed inline-block">
                          Ausgebucht
                        </span>
                      {:else if !isAdmin && !globalRegistrationOpen}
                        <div class="inline-block">
                          <CountdownTimer
                            targetDate={globalRegistrationStart || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
                            compact={true}
                            showSeconds={false}
                            label="Öffnet in"
                            completedLabel="Jetzt verfügbar!"
                            onComplete={() => {
                              globalRegistrationOpen = true;
                            }}
                          />
                        </div>
                      {:else if !hasRequiredBadge}
                        <span class="px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 text-sm rounded-lg cursor-not-allowed inline-block" title="Event-Teilnehmer Badge erforderlich">
                          🔒 Badge fehlt
                        </span>
                      {:else if !isRegistrationOpen(session.item, session.dayIndex, session.stageIndex, session.itemIndex) && session.item.registrationStartTime}
                        <div class="inline-block">
                          <CountdownTimer
                            targetDate={session.item.registrationStartTime}
                            onComplete={() => handleCountdownComplete(session.dayIndex, session.stageIndex, session.itemIndex)}
                            compact={true}
                            showSeconds={false}
                            label="Öffnet in"
                          />
                        </div>
                      {:else}
                        <button
                          on:click={() => registerForSession(session.event, session.item, session.dayIndex, session.stageIndex, session.itemIndex, session?.slotId)}
                          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-black text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={isRegistering}
                        >
                          {#if isRegistering}
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wird angemeldet...
                          {:else}
                            Anmelden
                          {/if}
                        </button>
                      {/if}
                    </div>
                  </div>

                  <!-- Event Info -->
                  <div class="mt-3 pt-3 border-t border-gray-800">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        Event: {session.event.title}
                      </span>
                      <a
                        href="/events/{session.event.slug.current}"
                        class="text-xs text-green-400 hover:text-green-300 transition-colors duration-200"
                      >
                        Event-Details →
                      </a>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>