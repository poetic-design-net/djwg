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

  function getEventHtml(dj: EnrichedProfile): string {
    const avatarHtml = dj.avatar_url
      ? `<img src="${dj.avatar_url}" alt="${dj.full_name || 'DJ'}" class="dj-avatar" />`
      : `<div class="dj-avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-6.627 0-12 4.373-12 9.777 0 1.223.993 2.223 2.217 2.223h19.566A2.22 2.22 0 0024 23.777C24 18.373 18.627 14 12 14z"/>
          </svg>
        </div>`;

    // Priorisiere username, dann full_name
    let displayName = dj.username || dj.full_name || '';

    if (!displayName && dj.email) {
      displayName = dj.email.split('@')[0];
    }
    if (!displayName) {
      displayName = 'DJ';
    }
    
    return `
      <div class="flex items-center gap-2">
        ${avatarHtml}
        <span class="dj-name">@${displayName}</span>
      </div>
    `;
  }
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
            title: '',
            start: currentDate.toISOString().split('T')[0],
            html: true,
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
      left: 'prev,next',
      center: 'title',
      right: ''
    },
    fixedWeekCount: false,
    eventClick: handleEventClick,
    height: 'auto',
    dayMaxEvents: true,
    firstDay: 1, // Start with Monday
    weekNumbers: true, // Aktiviert die Anzeige der Kalenderwochen
    weekText: 'KW', // Setzt das Präfix auf "KW"
    weekNumberFormat: { week: 'numeric' }, // Zeigt nur die Nummer an
    eventContent: (info) => {
      const dj = info.event.extendedProps.dj;
      const availability = info.event.extendedProps.availability;
      const el = document.createElement('div');
      el.className = 'flex items-center px-2 w-full h-full';
      el.innerHTML = getEventHtml(dj);
      el.title = `${dj.full_name || dj.email}\nVom ${formatDate(availability.start_date)} bis ${formatDate(availability.end_date)}`;
      return { domNodes: [el] };
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


<div class="space-y-6">
  <!-- Header -->
  <div class="prose prose-invert max-w-none">
    <h3 class="text-2xl font-medium mb-2">DJ Verfügbarkeiten</h3>
    <p class="text-gray-400 text-sm">
      Hier findest du eine Übersicht aller DJ Verfügbarkeiten im Kalender. Klicke auf einen DJ um eine Anfrage zu senden.
    </p>
  </div>

  <!-- Filter -->
  <div class="bg-gray-800/40 rounded-lg p-4 backdrop-blur-sm border border-gray-700/30">
    <div class="flex items-center flex-wrap gap-4">
      <div class="w-64">
        <label for="status" class="block text-xs font-medium text-gray-300 mb-1.5">Status Filter</label>
        <select
          id="status"
          bind:value={selectedStatus}
          class="w-full bg-gray-800/80 border border-gray-700/60 rounded-md px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"
        >
          <option value="all">Alle Status</option>
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <!-- Legend inline -->
      <div class="flex-grow flex items-center gap-5 justify-end">
        {#each statusOptions as option}
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-3 h-3 rounded-full" style="background-color: {option.color}"></span>
            <span class="text-sm text-gray-300">{option.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Calendar - Ohne jeglichen äußeren Rand oder Padding -->
  <div class="bg-gray-800/40 backdrop-blur-sm overflow-hidden p-0 border-0 calendar-container">
    {#if loading && !Object.keys(availabilities).length}
      <div class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-400">Kalender wird geladen...</p>
      </div>
    {:else if error}
      <div class="m-4 bg-red-900/30 text-red-200 px-4 py-3 rounded-md">
        {error}
      </div>
    {/if}

    <div
      bind:this={calendarEl}
      class="fc-theme-standard no-outer-border {loading ? 'opacity-50' : ''}"
      style="min-height: 600px;"
    >
      {#if !loading && !error && Object.keys(availabilities).length === 0}
        <p class="text-center text-gray-400 py-4">Keine Verfügbarkeitsdaten gefunden.</p>
      {/if}
    </div>
  </div>
</div>

{#if showModal && selectedDj}
  <DjDetailsModal dj={selectedDj} show={showModal} on:close={closeModal} />
{/if}

<style>
  /* Basis-Kalender-Styling */
  :global(.fc) {
    --fc-border-color: rgba(75, 85, 99, 0.4);
    --fc-button-text-color: #fff;
    --fc-button-bg-color: rgba(55, 65, 81, 0.7);
    --fc-button-border-color: transparent;
    --fc-button-hover-bg-color: rgba(75, 85, 99, 0.8);
    --fc-button-hover-border-color: transparent;
    --fc-button-active-bg-color: rgba(16, 185, 129, 0.8);
    --fc-button-active-border-color: transparent;
    --fc-today-bg-color: rgba(47, 45, 12, 0.5);
    --fc-neutral-bg-color: transparent;
    --fc-list-event-hover-bg-color: rgba(55, 65, 81, 0.7);
    --fc-page-bg-color: transparent;
    height: 100%;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Entferne alle äußeren Ränder und Abstände */
  :global(.no-outer-border) {
    border: 0 !important;
    padding: 16px !important;
    margin: 0 !important;
    outline: 0 !important;
  }
  
  :global(.calendar-container) {
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  /* Hauptcontainer */
  :global(.fc-theme-standard) {
    background-color: transparent;
    border: none !important;
    outline: none !important;
  }

  /* Grid-Layout und Tabellen */
  :global(.fc .fc-scrollgrid),
  :global(.fc .fc-scrollgrid-section > *),
  :global(.fc .fc-scrollgrid-section-header),
  :global(.fc .fc-scrollgrid-section-body),
  :global(.fc table) {
    border: none !important;
    outline: none !important;
  }
  
  :global(.fc-scrollgrid-section) {
    display: flex;
  }
  
  :global(.fc-scrollgrid-section-header),
  :global(.fc-scrollgrid-section-body) {
    width: 100%;
  }
  
  :global(.fc-scrollgrid-section table) {
    width: 100% !important;
    table-layout: fixed !important;
  }
  
  /* Zellengrößen anpassen für KW-Spalte */
  :global(.fc-col-header-cell),
  :global(.fc-daygrid-day) {
    min-width: 0 !important;
    width: calc(100% / 8) !important; /* Angepasst von 7 auf 8 Spalten */
  }

  /* KW-Spalte Styling */
  :global(.fc-daygrid-day.fc-day-other) {
    background-color: rgba(31, 41, 55, 0.2) !important;
  }
  
  :global(.fc-day-today .fc-scrollgrid-sync-inner) {
    background-color: var(--fc-today-bg-color) !important;
  }
  
  :global(.fc-daygrid-day.fc-week-number) {
    max-width: 50px !important;
    min-width: 50px !important;
    width: 50px !important;
  }
  
  :global(.fc-week-number) {
    background-color: rgba(31, 41, 55, 0.4) !important;
  }
  
  :global(.fc-week-number-cushion) {
    color: rgba(156, 163, 175, 0.9) !important;
    font-weight: 600 !important;
    font-size: 0.8rem !important;
    padding: 0.5rem 0.3rem !important;
    text-align: center !important;
  }

  /* Zellenränder */
  :global(.fc-theme-standard th),
  :global(.fc-theme-standard td) {
    border: 0 !important;
    border-right: 1px solid rgba(75, 85, 99, 0.6) !important;
    border-bottom: 1px solid rgba(75, 85, 99, 0.6) !important;
  }
  
  :global(.fc-theme-standard tr:last-child td) {
    border-bottom: 1px solid rgba(75, 85, 99, 0.6) !important; /* Korrigiert von 1 auf 1px */
  }
  
  :global(.fc-theme-standard td:last-child),
  :global(.fc-theme-standard th:last-child) {
    border-right: 0 !important;
  }
  
  /* Entferne alle äußeren Umrandungen */
  :global(.fc-scrollgrid),
  :global(.fc-scrollgrid-section),
  :global(.fc-scrollgrid-section > td),
  :global(.fc-scrollgrid-section > th),
  :global(.fc table) {
    border-width: 0 !important;
  }
  
  :global(.fc-view-harness),
  :global(.fc-view-harness-active) {
    border: none !important;
    outline: none !important;
  }

  /* Heutiger Tag */
  :global(.fc-day-today) {
    background-color: var(--fc-today-bg-color) !important;
  }

  /* Navigation Buttons */
  :global(.fc-button) {
    color: var(--fc-button-text-color);
    background-color: var(--fc-button-bg-color);
    border: none !important;
    border-radius: 0.375rem;
    padding: 0.4rem 0.75rem !important;
    font-weight: 500 !important;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  :global(.fc-prev-button),
  :global(.fc-next-button) {
    background-color: rgba(55, 65, 81, 0.7);
    min-width: 36px !important;
  }

  :global(.fc-button:hover) {
    background-color: var(--fc-button-hover-bg-color);
  }

  :global(.fc-button:focus) {
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
    outline: none;
  }

  :global(.fc-button-active) {
    background-color: var(--fc-button-active-bg-color) !important;
  }
  :global(a.fc-daygrid-week-number) {
    color: rgb(16, 185, 129) !important; /* text-green-500 */
    font-weight: 600 !important;
    font-size: 0.8rem !important;

    background-color: rgba(16, 185, 129, 0.1) !important; /* text-green-500/10 */
    position: absolute;
    left: 2px;
} 

  /* Tageszahlen und Kopfzeilen */
  :global(.fc-daygrid-day-number) {
    color: #D1D5DB;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0.75rem !important;
  
  }
  
  :global(.fc-col-header-cell-cushion) {
    color: #D1D5DB;
    font-weight: 500;
    padding: 0.75rem 0.5rem !important;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }

  /* Events */
  :global(.fc-event) {
    margin: 1px 2px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 36px;
    background: rgba(17, 24, 39, 0.5) !important;
    backdrop-filter: blur(4px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    border-radius: 0.25rem;
    border-left: 3px solid currentColor !important;
  }

  :global(.fc-event:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }

  :global(.fc-daygrid-event-harness) {
    margin: 3px 2px;
  }

  /* Tageszellen Formatierung */
  :global(.fc-daygrid-day-frame) {
    min-height: 120px;
    padding: 1px;
    border-top: none !important;
  }

  :global(.fc-daygrid-day-events) {
    padding: 2px 0;
  }

  :global(.fc-h-event) {
    border: none;
  }

  :global(.fc-event-main) {
    padding: 2px 4px;
  }

  /* Titel und Header */
  :global(.fc-toolbar-title) {
    color: white !important;
    font-weight: 500 !important;
    font-size: 1.25rem !important;
    letter-spacing: 0.01em;
  }

  :global(.fc-toolbar.fc-header-toolbar) {
    margin-bottom: 1.25rem !important;
    padding: 0 10px;
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

  /* Scrolling und Layout */
  :global(.fc-view-harness) {
    background: transparent;
  }

  :global(.fc-daygrid-body),
  :global(.fc-scrollgrid-sync-table) {
    width: 100% !important;
  }

  /* DJ Avatar und Name */
  :global(.dj-avatar), :global(.dj-avatar-placeholder) {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  :global(.dj-avatar-placeholder) {
    background: rgb(55, 65, 81);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    color: rgb(156, 163, 175);
  }

  :global(.dj-name) {
    font-size: 12px;
    font-weight: 500;
    color: rgb(229, 231, 235);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
  }

  :global(.fc-daygrid-event) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
</style>