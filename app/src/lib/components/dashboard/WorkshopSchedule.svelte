<script lang="ts">
  import { onMount } from 'svelte';
  import groq from 'groq';
  import { client } from '$lib/sanity/client';
  import { createEventDispatcher } from 'svelte';
  import { getImageUrl } from '$lib/sanity/image';

  export let userId: string;

  const dispatch = createEventDispatcher();

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
  }

  interface Registration {
    eventId: string;
    sessionTitle: string;
    dayIndex: number;
    stageIndex: number;
    itemIndex: number;
  }

  let events: Event[] = [];
  let userRegistrations: Registration[] = [];
  let isLoading = true;
  let error: string | null = null;
  let filter: 'all' | 'workshop' | 'openspace' = 'all';
  let expandedDays = new Set<string>();

  onMount(() => {
    loadEvents();
    loadUserRegistrations();
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
      console.log('Found eventSchedule documents:', schedules);

      // Now fetch all events and their schedules
      const query = groq`*[_type == "event"] {
        _id,
        title,
        slug,
        date,
        location,
        "schedule": *[_type == "eventSchedule" && references(^._id)][0] {
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
      } | order(date asc)`;

      const data = await client.fetch(query);
      console.log('Loaded all events:', data);

      // Filter only events that have schedule data
      events = (data || []).filter(e => e.schedule && e.schedule.days && e.schedule.days.length > 0);
      console.log('Events with schedule:', events);

      // If no events with schedule, show all events for debugging
      if (events.length === 0 && data.length > 0) {
        console.log('No events have schedule data. All events:', data);
      }

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

  function isRegistered(eventId: string, dayIndex: number, stageIndex: number, itemIndex: number): boolean {
    return userRegistrations.some(reg =>
      reg.eventId === eventId &&
      reg.dayIndex === dayIndex &&
      reg.stageIndex === stageIndex &&
      reg.itemIndex === itemIndex
    );
  }

  async function registerForSession(event: Event, session: ScheduleItem, dayIndex: number, stageIndex: number, itemIndex: number) {
    try {
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
        throw new Error('Registration failed');
      }

      await loadUserRegistrations();
      dispatch('registered', { event, session });

    } catch (err) {
      console.error('Error registering:', err);
      alert('Fehler bei der Anmeldung. Bitte versuche es erneut.');
    }
  }

  async function cancelRegistration(eventId: string, dayIndex: number, stageIndex: number, itemIndex: number) {
    try {
      const registration = userRegistrations.find(reg =>
        reg.eventId === eventId &&
        reg.dayIndex === dayIndex &&
        reg.stageIndex === stageIndex &&
        reg.itemIndex === itemIndex
      );

      if (!registration) return;

      // TODO: Find the registration ID and call DELETE endpoint
      await loadUserRegistrations();

    } catch (err) {
      console.error('Error cancelling registration:', err);
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
    if (!session.maxParticipants) return '';
    const available = session.maxParticipants - (session.currentParticipants || 0);
    if (available <= 0) return 'Ausgebucht';
    if (available <= 5) return `Nur noch ${available} Plätze`;
    return `${available} Plätze frei`;
  }

  function isWorkshopOrOpenSpace(item: ScheduleItem): boolean {
    // For now, show ALL schedule items (we can filter later)
    // This helps us see what data is actually available
    return true;

    // Original logic for later:
    // Check if type is explicitly set
    // if (item.type === 'workshop' || item.type === 'openspace') {
    //   return true;
    // }

    // Check title for keywords
    // const titleLower = item.title.toLowerCase();
    // return titleLower.includes('workshop') ||
    //        titleLower.includes('open space') ||
    //        titleLower.includes('openspace') ||
    //        titleLower.includes('session') ||
    //        titleLower.includes('kurs');
  }

  function getSessionType(item: ScheduleItem): 'workshop' | 'openspace' | 'other' {
    if (item.type) return item.type;

    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('workshop') || titleLower.includes('kurs')) {
      return 'workshop';
    }
    if (titleLower.includes('open space') || titleLower.includes('openspace')) {
      return 'openspace';
    }
    return 'other';
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

  // Get all workshop and open space sessions from all events
  $: allSessions = events.flatMap(event => {
    if (!event.schedule || !event.schedule.days) {
      console.log('Event has no schedule:', event.title);
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

    console.log('Sessions from event', event.title, ':', sessions);
    return sessions;
  });

  // Filter sessions based on selected filter
  $: filteredSessions = filter === 'all'
    ? allSessions
    : allSessions.filter(s => s.type === filter);

  // Debug output
  $: console.log('All sessions:', allSessions.length, allSessions);
  $: console.log('Filtered sessions:', filteredSessions.length, filteredSessions);

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

  $: console.log('Sessions by date:', sessionsByDate);
  $: console.log('Sorted dates:', sortedDates);
</script>

<div class="bg-black/40 border border-gray-800 rounded-3xl p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-2xl font-heading text-white mb-2">Event Schedule</h2>
      <p class="text-gray-400">Melde dich für Sessions an</p>
      {#if events.length > 0}
        <p class="text-xs text-gray-500 mt-1">
          {events.length} Events geladen, {allSessions.length} Sessions gefunden
        </p>
      {/if}
    </div>

    <!-- Filter Buttons -->
    <div class="flex gap-2">
      <button
        on:click={() => filter = 'all'}
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          {filter === 'all' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
      >
        Alle Sessions
      </button>
      <button
        on:click={() => filter = 'workshop'}
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          {filter === 'workshop' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
      >
        Workshops
      </button>
      <button
        on:click={() => filter = 'openspace'}
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          {filter === 'openspace' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
      >
        Open Space
      </button>
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
    <div class="space-y-6">
      {#each sortedDates as date}
        {@const sessions = sessionsByDate[date]}
        {@const dayKey = date}
        {@const isExpanded = expandedDays.has(dayKey)}

        <div class="bg-black/20 border border-gray-800 rounded-2xl overflow-hidden">
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

                <div class="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors duration-200">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <!-- Session Header -->
                      <div class="flex items-start gap-3 mb-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getSessionTypeColor(session.type)}">
                          {getSessionTypeLabel(session.type)}
                        </span>
                        <div class="flex-1">
                          <h4 class="text-lg font-medium text-white">{session.item.title}</h4>
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
                          class="px-4 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200"
                        >
                          Abmelden
                        </button>
                      {:else if isFull}
                        <span class="px-4 py-2 bg-gray-800 text-gray-500 text-sm rounded-lg cursor-not-allowed inline-block">
                          Ausgebucht
                        </span>
                      {:else}
                        <button
                          on:click={() => registerForSession(session.event, session.item, session.dayIndex, session.stageIndex, session.itemIndex)}
                          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-black text-sm rounded-lg transition-colors duration-200"
                        >
                          Anmelden
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