<script lang="ts">
  import type { Day, Stage, ScheduleItem } from '$lib/types/event';

  export let schedule: Day[] = [];
  export let isSecret: boolean = false;
  export let isAdmin: boolean = false;

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  }

  function parseTimeRange(timeStr: string): { start: Date; end?: Date } {
    const [startStr, endStr] = timeStr.split('-').map(t => t?.trim());
    const baseDate = '1970/01/01 ';
    return {
      start: new Date(baseDate + startStr),
      end: endStr ? new Date(baseDate + endStr) : undefined
    };
  }

  function generateTimeSlots(events: ScheduleItem[]): string[] {
    const timeSet = new Set<string>();
    
    events.forEach(event => {
      const { start, end } = parseTimeRange(event.time);
      timeSet.add(start.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      
      if (end) {
        timeSet.add(
          end.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        );
      }
    });

    return Array.from(timeSet).sort((a, b) => {
      return new Date(`1970/01/01 ${a}`).getTime() - new Date(`1970/01/01 ${b}`).getTime();
    });
  }

  function getEventStyles(event: ScheduleItem, timeSlots: string[]): { top: string; height: string } {
    const { start, end } = parseTimeRange(event.time);
    const startIndex = timeSlots.findIndex(slot => 
      new Date(`1970/01/01 ${slot}`).getTime() === start.getTime()
    );

    if (!end) return { top: `${startIndex * 65}px`, height: '60px' };

    const endIndex = timeSlots.findIndex(slot => 
      new Date(`1970/01/01 ${slot}`).getTime() === end.getTime()
    );

    const height = endIndex > startIndex ? (endIndex - startIndex) * 65 : 60;
    return { 
      top: `${startIndex * 65}px`,
      height: `${height}px`
    };
  }

  $: allEvents = schedule.flatMap(day => day.stages.flatMap(stage => stage.schedule));
  $: timeSlots = allEvents.length > 0 ? generateTimeSlots(allEvents) : [];
</script>

{#if schedule?.length > 0}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto">
      <div class="mb-20 text-center">
        <span class="inline-block mb-4 text-sm text-[#33cc99] font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Übersicht</h2>
      </div>

      {#if isSecret && !isAdmin}
        <div class="relative">
          <div class="absolute inset-0 backdrop-blur-xl bg-black/60 z-10 flex items-center justify-center rounded-3xl">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h3 class="text-2xl text-white mb-2">Noch geheim!</h3>
              <p class="text-gray-400">Der Zeitplan wird bald veröffentlicht.</p>
            </div>
          </div>
          <div class="opacity-20 pointer-events-none">
            <!-- Placeholder content to show blurred background -->
            <div class="h-96"></div>
          </div>
        </div>
      {:else}
      {#each schedule as day}
        <div class="mb-16">
          <h3 class="text-2xl text-white mb-6">{formatDate(day.date)}</h3>
          
          <div class="schedule-wrapper">
            <div class="schedule-container">
              <div class="schedule-header">
                <div class="header-cell time-header">Zeit</div>
                {#each day.stages as stage}
                  <div class="header-cell stage-header">{stage.name}</div>
                {/each}
              </div>

              <div class="schedule-body">
                <div class="time-column">
                  {#each timeSlots as timeSlot}
                    <div class="time-cell">{timeSlot}</div>
                  {/each}
                </div>

                {#each day.stages as stage}
                  <div class="stage-column">
                    {#each stage.schedule as event}
                      {@const styles = getEventStyles(event, timeSlots)}
                      <div 
                        class="event-card"
                        style="top: {styles.top}; height: {styles.height};"
                      >
                        <p class="text-white font-medium">{event.title}</p>
                        {#if event.instructor}
                          <div class="flex items-center gap-2 mt-1">
                            <p class="text-[#33cc99] text-sm">{event.instructor.name}</p>
                            {#if event.instructor.soundcloud}
                              <a 
                                href={event.instructor.soundcloud} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="text-[#33cc99] hover:text-[#33cc99]/80"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M2.048 13.164l.343 1.632-.343 1.607c-.007.037-.037.064-.074.064s-.067-.027-.074-.064l-.301-1.607.301-1.632c.007-.033.037-.06.074-.06.037 0 .067.027.074.06zm1.005-1.105l.462 2.737-.462 2.7c-.007.037-.037.067-.078.067s-.071-.03-.074-.067l-.404-2.7.404-2.737c.004-.034.033-.06.074-.06s.071.026.078.06zm1.004-.273l.43 3.01-.43 2.935c-.004.044-.037.078-.082.078-.041 0-.075-.034-.082-.078l-.372-2.935.372-3.01c.007-.041.041-.071.082-.071s.078.03.082.071zm1.008.152l.398 2.858-.398 2.86c-.004.049-.041.086-.09.086-.045 0-.082-.037-.086-.086l-.344-2.86.344-2.858c.004-.045.041-.082.086-.082s.086.034.09.082zm1.015-.073l.367 2.931-.367 2.842c-.004.052-.045.09-.093.09-.053 0-.09-.037-.093-.09l-.315-2.842.315-2.931c.004-.049.041-.086.093-.086s.089.037.093.086zm1.023-.349l.334 3.28-.334 2.799c-.004.056-.045.097-.101.097s-.093-.041-.097-.097l-.286-2.799.286-3.28c.004-.052.041-.09.097-.09.056 0 .097.037.101.09zm1.026-.224l.304 3.504-.304 2.812c-.004.06-.048.104-.108.104s-.101-.044-.104-.104l-.274-2.812.274-3.504c.003-.056.045-.097.104-.097s.104.041.108.097zm1.03-.224l.274 3.728-.274 2.771c0 .067-.052.116-.112.116-.064 0-.112-.049-.115-.116l-.244-2.771.244-3.728c.003-.063.052-.108.115-.108.06 0 .112.045.112.108zm1.036-.134l.244 3.862-.244 2.753c0 .071-.056.123-.12.123-.064 0-.116-.052-.12-.123l-.215-2.753.215-3.862c.004-.067.056-.115.12-.115s.12.048.12.115zm1.04-.112l.215 3.974-.215 2.734c0 .075-.056.13-.127.13s-.124-.055-.127-.13l-.19-2.734.19-3.974c.004-.071.056-.123.127-.123s.127.052.127.123zm1.045-.127l.189 4.101-.189 2.72c0 .082-.06.141-.134.141-.075 0-.135-.06-.135-.142l-.165-2.718.165-4.101c0-.075.06-.13.135-.13.074 0 .134.055.134.13zm1.052-.089l.16 4.19-.16 2.697c0 .086-.063.149-.142.149s-.142-.063-.142-.149l-.138-2.697.138-4.19c0-.082.063-.141.142-.141s.142.06.142.141zm1.056-.067l.134 4.257-.134 2.686c0 .093-.067.156-.15.156-.082 0-.149-.064-.149-.156l-.112-2.686.112-4.257c0-.086.067-.149.149-.149.082 0 .15.063.15.149zm1.063-.06l.104 4.317-.104 2.686c0 .097-.07.167-.157.167-.086 0-.157-.07-.157-.167l-.082-2.686.082-4.317c0-.093.071-.16.157-.16.086 0 .157.067.157.16zm1.176.06l.075 4.257-.075 2.671c0 .108-.075.179-.168.179s-.171-.071-.171-.179l-.052-2.667.052-4.261c0-.097.078-.171.171-.171.093 0 .168.075.168.171zm1.003-.374l.045 4.631-.045 2.671c0 .112-.082.19-.179.19s-.179-.078-.179-.19v-2.671l.001-4.631c0-.104.078-.186.178-.186s.179.082.179.186zm2.55-2.194c.712 0 1.3.537 1.374 1.226l.116 3.399-.116 2.682c0 .749-.615 1.359-1.374 1.359-.755 0-1.37-.61-1.37-1.359l-.097-2.682.097-3.399c0-.749.615-1.359 1.37-1.359z"/>
                                </svg>
                              </a>
                            {/if}
                            {#if event.instructor.instagram}
                              <a 
                                href={event.instructor.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="text-[#33cc99] hover:text-[#33cc99]/80 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
      {/if}
    </div>
  </div>
{:else}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto text-center">
      <p class="text-gray-400">Kein Schedule verfügbar.</p>
    </div>
  </div>
{/if}

<style>
  .schedule-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .schedule-container {
    min-width: 800px;
    width: 100%;
    display: table;
    table-layout: fixed;
  }

  .schedule-header {
    display: table-header-group;
    background-color: rgba(0, 0, 0);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-cell {
    display: table-cell;
    padding: 0.75rem;
    color: #33cc99;
    font-weight: 500;
    text-align: left;
    min-width: 180px;
  }

  .time-header {
    width: 100px;
    min-width: 100px;
  }

  .stage-header {
    width: auto;
  }

  .schedule-body {
    display: table-row-group;
    position: relative;
  }

  .time-column {
    display: table-cell;
    position: sticky;
    left: 0;
    background-color: rgb(0, 0, 0);
    z-index: 5;
    width: 100px;
    min-width: 100px;
    vertical-align: top;
  }

  .time-cell {
    height: 65px;
    padding: 0.75rem;
    color: white;
    border-bottom: 1px solid #374151;
  }

  .stage-column {
    display: table-cell;
    position: relative;
    min-height: calc(65px * var(--total-slots, 1));
    border-left: 1px solid #374151;
    width: auto;
    min-width: 180px;
    vertical-align: top;
  }

  .event-card {
    position: absolute;
    left: 4px;
    right: 4px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid #374151;
    border-radius: 0.5rem;
    padding: 0.75rem;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
  }

  .event-card:hover {
    border-color: #33cc99;
    transform: scale(1.01);
    z-index: 1;
  }

  .schedule-wrapper::-webkit-scrollbar {
    height: 8px;
  }

  .schedule-wrapper::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 4px;
  }

  .schedule-wrapper::-webkit-scrollbar-thumb {
    background-color: #33cc99;
    border-radius: 4px;
  }
</style>
