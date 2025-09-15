<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import type { PageData } from './$types';

  export let data: PageData;

  interface Registration {
    _id: string;
    eventId: string;
    eventTitle?: string;
    dayIndex: number;
    stageIndex: number;
    itemIndex: number;
    sessionTitle: string;
    sessionTime: string;
    userName: string;
    userEmail: string;
    profileId: string;
    status: 'confirmed' | 'waitlist' | 'cancelled';
    createdAt: string;
  }

  interface SessionGroup {
    key: string;
    eventId: string;
    eventTitle: string;
    dayIndex: number;
    stageIndex: number;
    itemIndex: number;
    sessionTitle: string;
    sessionTime: string;
    stageName?: string;
    dayDate?: string;
    registrations: Registration[];
    confirmedCount: number;
    waitlistCount: number;
    maxRegistrations?: number;
  }

  let selectedEventId: string = '';
  let selectedScheduleId: string = '';
  let registrations: Registration[] = [];
  let sessionGroups: SessionGroup[] = [];
  let isLoading = false;
  let searchQuery = '';
  let statusFilter: 'all' | 'confirmed' | 'waitlist' | 'cancelled' = 'all';
  let viewMode: 'sessions' | 'users' | 'timeline' = 'sessions';
  let expandedSessions: Set<string> = new Set();

  // Statistics
  let stats = {
    totalRegistrations: 0,
    confirmedCount: 0,
    waitlistCount: 0,
    cancelledCount: 0,
    uniqueUsers: 0,
    sessionsWithRegistrations: 0
  };

  $: filteredSessionGroups = sessionGroups.filter(group => {
    const matchesSearch = searchQuery === '' ||
      group.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.registrations.some(r =>
        r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === 'all' ||
      group.registrations.some(r => r.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  onMount(() => {
    if (data.events.length > 0) {
      selectedEventId = data.events[0]._id;
      loadRegistrations();
    }
  });

  async function loadRegistrations() {
    if (!selectedEventId) return;

    isLoading = true;

    try {
      // Fetch registrations for selected event
      const response = await fetch(`/api/schedule-registrations?eventId=${selectedEventId}`);
      const result = await response.json();

      if (result.success) {
        registrations = result.data;

        // Get the event details
        const event = data.events.find(e => e._id === selectedEventId);
        const scheduleId = event?.scheduleId;

        if (scheduleId) {
          selectedScheduleId = scheduleId;
          const schedule = data.schedules.find(s => s._id === scheduleId);

          if (schedule) {
            groupRegistrationsBySessions(registrations, schedule, event);
          }
        }

        calculateStatistics();
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      isLoading = false;
    }
  }

  function groupRegistrationsBySessions(regs: Registration[], schedule: any, event: any) {
    const groups = new Map<string, SessionGroup>();

    // Process each registration
    regs.forEach(reg => {
      const key = `${reg.dayIndex}-${reg.stageIndex}-${reg.itemIndex}`;

      if (!groups.has(key)) {
        // Get session details from schedule
        const day = schedule.days?.[reg.dayIndex];
        const stage = day?.stages?.[reg.stageIndex];
        const item = stage?.schedule?.[reg.itemIndex];

        groups.set(key, {
          key,
          eventId: selectedEventId,
          eventTitle: event.title,
          dayIndex: reg.dayIndex,
          stageIndex: reg.stageIndex,
          itemIndex: reg.itemIndex,
          sessionTitle: reg.sessionTitle || item?.title || 'Unknown Session',
          sessionTime: reg.sessionTime || item?.time || '',
          stageName: stage?.name,
          dayDate: day?.date,
          registrations: [],
          confirmedCount: 0,
          waitlistCount: 0,
          maxRegistrations: item?.maxRegistrations
        });
      }

      const group = groups.get(key)!;
      group.registrations.push(reg);

      if (reg.status === 'confirmed') {
        group.confirmedCount++;
      } else if (reg.status === 'waitlist') {
        group.waitlistCount++;
      }
    });

    sessionGroups = Array.from(groups.values()).sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      if (a.stageIndex !== b.stageIndex) return a.stageIndex - b.stageIndex;
      return a.itemIndex - b.itemIndex;
    });
  }

  function calculateStatistics() {
    const uniqueUserIds = new Set<string>();
    let confirmed = 0;
    let waitlist = 0;
    let cancelled = 0;

    registrations.forEach(reg => {
      uniqueUserIds.add(reg.profileId);

      switch (reg.status) {
        case 'confirmed':
          confirmed++;
          break;
        case 'waitlist':
          waitlist++;
          break;
        case 'cancelled':
          cancelled++;
          break;
      }
    });

    stats = {
      totalRegistrations: registrations.length,
      confirmedCount: confirmed,
      waitlistCount: waitlist,
      cancelledCount: cancelled,
      uniqueUsers: uniqueUserIds.size,
      sessionsWithRegistrations: sessionGroups.length
    };
  }

  function toggleSession(key: string) {
    if (expandedSessions.has(key)) {
      expandedSessions.delete(key);
    } else {
      expandedSessions.add(key);
    }
    expandedSessions = new Set(expandedSessions);
  }

  async function exportToCSV() {
    const csvRows = [];
    const headers = [
      'Event', 'Tag', 'Bühne', 'Session', 'Zeit',
      'Name', 'Email', 'Status', 'Angemeldet am'
    ];
    csvRows.push(headers.join(','));

    sessionGroups.forEach(group => {
      group.registrations.forEach(reg => {
        const row = [
          group.eventTitle,
          group.dayDate || `Tag ${group.dayIndex + 1}`,
          group.stageName || `Bühne ${group.stageIndex + 1}`,
          group.sessionTitle,
          group.sessionTime,
          reg.userName,
          reg.userEmail,
          reg.status,
          new Date(reg.createdAt).toLocaleString('de-DE')
        ];
        csvRows.push(row.map(v => `"${v}"`).join(','));
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_${selectedEventId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return 'Kein Datum';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return the string as is
        return dateStr;
      }
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateStr || 'Kein Datum';
    }
  }

  function formatDateTime(dateStr: string) {
    if (!dateStr) return 'Kein Datum';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateStr || 'Kein Datum';
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'waitlist':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'waitlist':
        return 'Warteliste';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-white mb-2">Event Registrierungen</h1>
    <p class="text-gray-400">Verwalte alle Anmeldungen für Events und Sessions</p>
  </div>

  <!-- Event Selector -->
  <div class="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-800">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Event auswählen</label>
        <select
          bind:value={selectedEventId}
          on:change={loadRegistrations}
          class="w-full px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="">-- Event wählen --</option>
          {#each data.events as event}
            <option value={event._id}>
              {event.title} - {formatDate(event.date)}
            </option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Ansicht</label>
        <div class="flex gap-2">
          <button
            on:click={() => viewMode = 'sessions'}
            class="px-4 py-2 rounded-lg transition-colors {viewMode === 'sessions' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
          >
            Sessions
          </button>
          <button
            on:click={() => viewMode = 'users'}
            class="px-4 py-2 rounded-lg transition-colors {viewMode === 'users' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
          >
            Teilnehmer
          </button>
          <button
            on:click={() => viewMode = 'timeline'}
            class="px-4 py-2 rounded-lg transition-colors {viewMode === 'timeline' ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
          >
            Timeline
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if selectedEventId}
    <!-- Statistics -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <div class="text-2xl font-bold text-white">{stats.totalRegistrations}</div>
        <div class="text-sm text-gray-400">Gesamt</div>
      </div>
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-green-800/50">
        <div class="text-2xl font-bold text-green-400">{stats.confirmedCount}</div>
        <div class="text-sm text-gray-400">Bestätigt</div>
      </div>
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-yellow-800/50">
        <div class="text-2xl font-bold text-yellow-400">{stats.waitlistCount}</div>
        <div class="text-sm text-gray-400">Warteliste</div>
      </div>
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-red-800/50">
        <div class="text-2xl font-bold text-red-400">{stats.cancelledCount}</div>
        <div class="text-sm text-gray-400">Storniert</div>
      </div>
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-blue-800/50">
        <div class="text-2xl font-bold text-blue-400">{stats.uniqueUsers}</div>
        <div class="text-sm text-gray-400">Teilnehmer</div>
      </div>
      <div class="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-purple-800/50">
        <div class="text-2xl font-bold text-purple-400">{stats.sessionsWithRegistrations}</div>
        <div class="text-sm text-gray-400">Sessions</div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-black/40 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-800">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Suche nach Name, Email oder Session..."
            class="w-full px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
        <select
          bind:value={statusFilter}
          class="px-4 py-2 bg-black/60 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
        >
          <option value="all">Alle Status</option>
          <option value="confirmed">Bestätigt</option>
          <option value="waitlist">Warteliste</option>
          <option value="cancelled">Storniert</option>
        </select>
        <button
          on:click={exportToCSV}
          class="px-6 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
        >
          CSV Export
        </button>
      </div>
    </div>

    <!-- Content -->
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    {:else if viewMode === 'sessions'}
      <!-- Sessions View -->
      <div class="space-y-4">
        {#each filteredSessionGroups as group (group.key)}
          <div class="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden" transition:fade>
            <button
              on:click={() => toggleSession(group.key)}
              class="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div class="flex items-center gap-4">
                <div class="text-left">
                  <h3 class="text-lg font-semibold text-white">{group.sessionTitle}</h3>
                  <div class="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <span>{group.dayDate ? formatDate(group.dayDate) : `Tag ${group.dayIndex + 1}`}</span>
                    <span>•</span>
                    <span>{group.stageName || `Bühne ${group.stageIndex + 1}`}</span>
                    <span>•</span>
                    <span>{group.sessionTime}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex gap-2">
                  <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {group.confirmedCount} bestätigt
                  </span>
                  {#if group.waitlistCount > 0}
                    <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      {group.waitlistCount} Warteliste
                    </span>
                  {/if}
                  {#if group.maxRegistrations}
                    <span class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      Max: {group.maxRegistrations}
                    </span>
                  {/if}
                </div>
                <svg
                  class="w-5 h-5 text-gray-400 transition-transform {expandedSessions.has(group.key) ? 'rotate-180' : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {#if expandedSessions.has(group.key)}
              <div class="border-t border-gray-800" transition:slide>
                <div class="p-6">
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="text-left border-b border-gray-800">
                          <th class="pb-3 text-sm font-medium text-gray-400">Name</th>
                          <th class="pb-3 text-sm font-medium text-gray-400">Email</th>
                          <th class="pb-3 text-sm font-medium text-gray-400">Status</th>
                          <th class="pb-3 text-sm font-medium text-gray-400">Angemeldet am</th>
                          <th class="pb-3 text-sm font-medium text-gray-400">Aktionen</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-800">
                        {#each group.registrations.sort((a, b) => {
                          if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
                          if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
                          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        }) as reg}
                          <tr class="hover:bg-white/5">
                            <td class="py-3 text-white">{reg.userName}</td>
                            <td class="py-3 text-gray-300">
                              <a href="mailto:{reg.userEmail}" class="hover:text-green-400">
                                {reg.userEmail}
                              </a>
                            </td>
                            <td class="py-3">
                              <span class="px-2 py-1 text-xs rounded-full {getStatusBadgeClass(reg.status)}">
                                {getStatusLabel(reg.status)}
                              </span>
                            </td>
                            <td class="py-3 text-gray-400 text-sm">
                              {formatDateTime(reg.createdAt)}
                            </td>
                            <td class="py-3">
                              <button
                                class="text-gray-400 hover:text-green-400 transition-colors"
                                title="Details anzeigen"
                              >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else if viewMode === 'users'}
      <!-- Users View -->
      <div class="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left border-b border-gray-800">
                <th class="pb-3 text-sm font-medium text-gray-400">Teilnehmer</th>
                <th class="pb-3 text-sm font-medium text-gray-400">Email</th>
                <th class="pb-3 text-sm font-medium text-gray-400">Anmeldungen</th>
                <th class="pb-3 text-sm font-medium text-gray-400">Sessions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              {#each (() => {
                const userMap = new Map();
                registrations.forEach(reg => {
                  if (userMap.has(reg.profileId)) {
                    userMap.get(reg.profileId).sessions.push(reg);
                  } else {
                    userMap.set(reg.profileId, {
                      name: reg.userName,
                      email: reg.userEmail,
                      sessions: [reg]
                    });
                  }
                });
                return Array.from(userMap.entries());
              })() as [userId, userData]}
                <tr class="hover:bg-white/5">
                  <td class="py-3 text-white font-medium">{userData.name}</td>
                  <td class="py-3 text-gray-300">
                    <a href="mailto:{userData.email}" class="hover:text-green-400">
                      {userData.email}
                    </a>
                  </td>
                  <td class="py-3 text-gray-400">{userData.sessions.length}</td>
                  <td class="py-3">
                    <div class="flex flex-wrap gap-1">
                      {#each userData.sessions.slice(0, 3) as session}
                        <span class="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                          {session.sessionTitle}
                        </span>
                      {/each}
                      {#if userData.sessions.length > 3}
                        <span class="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                          +{userData.sessions.length - 3} mehr
                        </span>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else if viewMode === 'timeline'}
      <!-- Timeline View -->
      <div class="space-y-6">
        {#if data.schedules.find(s => s._id === selectedScheduleId)}
          {@const schedule = data.schedules.find(s => s._id === selectedScheduleId)}
          {#each schedule.days as day, dayIndex}
            <div class="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <h3 class="text-xl font-bold text-white mb-4">
                {day.date ? formatDate(day.date) : `Tag ${dayIndex + 1}`}
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {#each day.stages as stage, stageIndex}
                  <div class="bg-black/60 rounded-lg p-4 border border-gray-700">
                    <h4 class="text-lg font-semibold text-green-400 mb-3">{stage.name}</h4>
                    <div class="space-y-2">
                      {#each stage.schedule as item, itemIndex}
                        {#if true}
                          {@const key = `${dayIndex}-${stageIndex}-${itemIndex}`}
                          {@const group = sessionGroups.find(g => g.key === key)}
                          <div class="p-3 bg-black/40 rounded-lg border border-gray-800">
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <div class="text-sm text-gray-400">{item.time}</div>
                              <div class="text-white font-medium">{item.title}</div>
                            </div>
                            {#if group}
                              <div class="text-right">
                                <div class="text-green-400 text-sm font-medium">
                                  {group.confirmedCount}
                                  {#if item.maxRegistrations}
                                    /{item.maxRegistrations}
                                  {/if}
                                </div>
                                {#if group.waitlistCount > 0}
                                  <div class="text-yellow-400 text-xs">
                                    +{group.waitlistCount} WL
                                  </div>
                                {/if}
                              </div>
                            {:else}
                              <div class="text-gray-600 text-sm">0</div>
                            {/if}
                          </div>
                        </div>
                        {/if}
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  {:else}
    <div class="bg-black/40 backdrop-blur-sm rounded-xl p-12 border border-gray-800 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-400">Wähle ein Event aus, um die Registrierungen anzuzeigen</p>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar */
  :global(.container) {
    scrollbar-width: thin;
    scrollbar-color: #374151 #111827;
  }

  :global(.container::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(.container::-webkit-scrollbar-track) {
    background: #111827;
  }

  :global(.container::-webkit-scrollbar-thumb) {
    background: #374151;
    border-radius: 4px;
  }

  :global(.container::-webkit-scrollbar-thumb:hover) {
    background: #4b5563;
  }
</style>