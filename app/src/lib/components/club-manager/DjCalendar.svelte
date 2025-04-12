<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';
  import type { EnrichedProfile } from '$lib/types/profile';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import { browser } from '$app/environment';
  import DjDetailsModal from './DjDetailsModal.svelte';

  export let djs: EnrichedProfile[];

  const supabase = getContext<SupabaseClient>('supabase');

  interface Availability {
    id: string;
    user_id: string;
    start_date: string;
    end_date: string;
    status: 'available' | 'requested' | 'booked';
    created_at: string;
    updated_at: string;
  }

  const statusOptions = [
    { value: 'available' as const, label: 'Verfügbar', color: '#10B981' },
    { value: 'requested' as const, label: 'Angefragt', color: '#F59E0B' },
    { value: 'booked' as const, label: 'Gebucht', color: '#EF4444' }
  ];

  let availabilities: {[key: string]: Availability[]} = {};
  let loading = false;
  let error: string | null = null;
  let calendar: Calendar | undefined;
  let calendarEl: HTMLElement;
  let selectedStatus = 'all';
  let selectedDj: EnrichedProfile | null = null;
  let showModal = false;

  const formatDate = (dateString: string): string => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Ungültiges Datum';
    }
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  async function loadAllAvailabilities() {
    loading = true;
    error = null;
    try {
      for (const dj of djs) {
        const { data, error: fetchError } = await supabase
          .from('dj_availability')
          .select('*')
          .eq('user_id', dj.id)
          .order('start_date', { ascending: true });
        if (fetchError) throw fetchError;
        availabilities[dj.id] = data || [];
      }
      updateCalendarEvents();
    } catch (err) {
      error = 'Verfügbarkeiten konnten nicht geladen werden.';
      availabilities = {};
    } finally {
      loading = false;
    }
  }

  function getCalendarEvents() {
    const events = [];
    
    for (const dj of djs) {
      const djAvailabilities = availabilities[dj.id] || [];
      
      for (const availability of djAvailabilities) {
        if (selectedStatus !== 'all' && availability.status !== selectedStatus) {
          continue;
        }
        
        const statusInfo = statusOptions.find(opt => opt.value === availability.status);
        
        const startDate = new Date(availability.start_date);
        const endDate = new Date(availability.end_date);
        
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          events.push({
            id: `${availability.id}-${currentDate.toISOString().split('T')[0]}`,
            title: `${dj.full_name || dj.email || 'Unbek. DJ'}`,
            start: currentDate.toISOString().split('T')[0],
            allDay: true,
            backgroundColor: statusInfo?.color || '#888888',
            borderColor: 'transparent',
            textColor: '#FFFFFF',
            extendedProps: { 
              dj, 
              availability,
              originalStartDate: availability.start_date,
              originalEndDate: availability.end_date
            }
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }
    
    return events;
  }

  function updateCalendarEvents() {
    if (calendar) {
      const events = getCalendarEvents();
      calendar.removeAllEventSources();
      calendar.addEventSource(events);
    }
  }

  function handleEventClick(info: any) {
    error = null;
    selectedDj = info.event.extendedProps.dj;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedDj = null;
  }

  function initializeCalendar() {
    if (!browser || !calendarEl || calendar) return;
    
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'de',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      eventClick: handleEventClick,
      height: 'auto',
      dayMaxEvents: true,
      eventDidMount: (info) => {
        const availability = info.event.extendedProps.availability;
        const dj = info.event.extendedProps.dj;
        info.el.title = `${dj.full_name || dj.email}\nVom ${formatDate(availability.start_date)} bis ${formatDate(availability.end_date)}`;
      }
    });

    calendar.render();
    loadAllAvailabilities();
  }

  $: if (browser && calendar && selectedStatus !== undefined) {
    updateCalendarEvents();
  }

  onMount(() => {
    initializeCalendar();
    return () => {
      if (calendar) {
        calendar.destroy();
        calendar = undefined;
      }
    };
  });
</script>

<div class="space-y-8">
  <div class="prose prose-invert max-w-none">
    <h3>DJ Verfügbarkeiten</h3>
    <p class="text-gray-400">
      Hier findest du eine Übersicht aller DJ Verfügbarkeiten im Kalender. Klicke auf einen DJ um eine Anfrage zu senden.
    </p>
  </div>

  <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
    <div class="flex items-center gap-4">
      <div class="flex-grow">
        <label for="status" class="block text-sm font-medium text-gray-400 mb-1">Status Filter</label>
        <select
          id="status"
          bind:value={selectedStatus}
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Alle Status</option>
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
    {#if loading && !Object.keys(availabilities).length}
      <div class="text-center py-8">
        <svg class="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-400">Kalender wird geladen...</p>
      </div>
    {:else if error}
      <div class="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
        {error}
      </div>
    {/if}

    <div
      bind:this={calendarEl}
      class="bg-gray-800/50 rounded-lg p-4 fc-theme-standard {loading ? 'opacity-50' : ''}"
      style="min-height: 600px;"
    >
      {#if !loading && !error && Object.keys(availabilities).length === 0}
        <p class="text-center text-gray-400 py-4">Keine Verfügbarkeitsdaten gefunden.</p>
      {/if}
    </div>
  </div>

  <div class="bg-gray-900/50 rounded-xl p-6 border border-gray-800/60">
    <h4 class="text-lg font-medium text-white mb-4">Legende</h4>
    <div class="space-y-2">
      {#each statusOptions as option}
        <div class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded-full" style="background-color: {option.color}"></span>
          <span class="text-gray-300">{option.label}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

{#if showModal && selectedDj}
  <DjDetailsModal dj={selectedDj} show={showModal} on:close={closeModal} />
{/if}

<style>
  :global(.fc) {
    --fc-border-color: theme('colors.gray.700');
    --fc-button-text-color: theme('colors.white');
    --fc-button-bg-color: theme('colors.gray.700');
    --fc-button-border-color: theme('colors.gray.600');
    --fc-button-hover-bg-color: theme('colors.gray.600');
    --fc-button-hover-border-color: theme('colors.gray.500');
    --fc-button-active-bg-color: theme('colors.indigo.600');
    --fc-button-active-border-color: theme('colors.indigo.500');
    --fc-today-bg-color: theme('colors.gray.700/30');
    --fc-neutral-bg-color: theme('colors.gray.800/50');
    --fc-list-event-hover-bg-color: theme('colors.gray.700');
    --fc-page-bg-color: transparent;
  }

  :global(.fc-theme-standard) {
    background-color: transparent;
  }

  :global(.fc-theme-standard th),
  :global(.fc-theme-standard td) {
    border-color: theme('colors.gray.700/50') !important;
  }

  :global(.fc-day-today) {
    background-color: var(--fc-today-bg-color) !important;
  }

  :global(.fc-button) {
    @apply text-white transition-colors duration-200;
  }

  :global(.fc-button:focus) {
    box-shadow: 0 0 0 2px theme('colors.indigo.500');
    outline: none;
  }

  :global(.fc-daygrid-day-number),
  :global(.fc-col-header-cell-cushion) {
    @apply text-gray-300;
  }
  
  :global(.fc-event) {
    padding: 4px 8px;
    margin: 1px 0;
  }

  :global(.fc-daygrid-event-harness) {
    margin: 2px 0;
  }

  :global(.fc-daygrid-day-frame) {
    min-height: 120px;
    display: flex;
    flex-direction: column;
  }

  :global(.fc-daygrid-day-events) {
    flex-grow: 1;
    margin: 0 !important;
    padding: 2px 0;
  }

  :global(.fc-h-event) {
    border: none;
    padding: 2px 4px;
  }

  :global(.fc-v-event) {
    border: none;
  }

  :global(.fc-event-main) {
    padding: 2px 4px;
  }

  :global(.fc-event-title) {
    font-weight: 500;
    white-space: normal;
  }

  :global(.fc td) {
    min-width: 120px;
  }

  :global(.fc-col-header-cell) {
    padding: 8px 0;
  }

  :global(.fc-scrollgrid),
  :global(.fc-scrollgrid-sync-table),
  :global(.fc-daygrid-body),
  :global(.fc-daygrid-body table) {
    width: 100% !important;
  }

  :global(.fc-daygrid-body),
  :global(.fc-scroller) {
    overflow: visible !important;
  }

  :global(.fc-view-harness) {
    overflow: auto !important;
  }

  :global(.fc-toolbar-title) {
    color: white !important;
    text-align: center !important;
    font-weight: 500 !important;
    font-size: 1.25rem !important;
    width: 100% !important;
  }

  :global(.fc-toolbar.fc-header-toolbar) {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem !important;
  }

  :global(.fc-toolbar-chunk:first-child) {
    flex: 1;
  }

  :global(.fc-toolbar-chunk:nth-child(2)) {
    flex: 2;
    display: flex;
    justify-content: center;
  }

  :global(.fc-toolbar-chunk:last-child) {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }
</style>