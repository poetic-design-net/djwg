<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let id: string | undefined = undefined;
  const dispatch = createEventDispatcher();

  interface Ticket {
    _id: string;
    phase: string;
    title: string;
    description: string;
    features: string[];
    status: 'completed' | 'current' | 'coming-soon';
    price: number;
    currency: string;
    url?: string;
  }

  interface Event {
    _id: string;
    title: string;
    date: string;
  }

  export let title: string = "Sichere dir dein Ticket";
  export let description: string = "Wähle die passende Phase für dein Event-Ticket";
  export let tickets: Ticket[] = [];
  export let selectedEvent: Event | undefined = undefined;
  export let showEventSelector: boolean = false;
  export let events: Event[] = [];

  function selectEvent(event: Event) {
    if (event._id !== selectedEvent?._id) {
      dispatch('eventChange', event);
    }
  }

  function formatDate(dateStr: string): string {
    try {
      if (!dateStr) return '';
      
      // Überprüfen, ob es sich um das Format DD.MM.YYYY handelt
      const germanDateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
      const match = dateStr.match(germanDateRegex);
      
      let date: Date;
      if (match) {
        // Wenn es ein deutsches Datum ist, konvertieren wir es
        const [_, day, month, year] = match;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Ansonsten versuchen wir es als ISO-Datum zu parsen
        date = new Date(dateStr);
      }

      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateStr);
        return '';
      }

      return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
</script>

<section {id} class="relative overflow-hidden py-24 md:py-36 ">
<div class="container px-4 mx-auto">
   {#if showEventSelector && events.length > 1}
     <div class="flex flex-wrap justify-center mb-8 gap-4">
       {#each events as event}
         <button
           class="px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 {selectedEvent?._id === event._id ? 'bg-green-500 text-black' : 'text-white hover:text-green-500 border border-gray-600 hover:border-green-500'}"
           on:click={() => selectEvent(event)}
         >
           {event.title}
         </button>
       {/each}
     </div>
   {/if}

   <!-- Selected Event Date -->
   {#if selectedEvent?.date && formatDate(selectedEvent.date)}
     <div class="text-center mb-12">
       <p class="text-white font-medium border border-green-600 rounded-full px-6 py-2 inline-block">{formatDate(selectedEvent.date)}</p>
     </div>
   {/if}
  <div class="text-center mb-20">
    <span class="inline-block mb-4 text-sm text-tourquis-500 font-medium tracking-tighter">Ticket Phasen</span>
    <h2 class="font-heading mb-6 text-5xl md:text-6xl text-white tracking-tighter">{title}</h2>
    <p class="text-lg text-gray-300 md:max-w-md mx-auto">{description}</p>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 {tickets.length <= 3 ? 'lg:grid-cols-' + tickets.length : 'lg:grid-cols-3'} {tickets.length === 4 ? 'xl:grid-cols-4' : ''} gap-8 max-w-7xl mx-auto">
    {#each tickets as ticket}
      <div class="h-full">
        <div class="relative h-full flex flex-col {ticket.status === 'completed' ? 'bg-black/20 border-gray-900' : ticket.status === 'current' ? 'bg-black/40 border-purple-500 hover:border-green-500 cursor-pointer' : 'bg-black/40 border-gray-800'} border-2 rounded-5xl bg-gradient-radial-dark transition duration-200">
          <!-- Content Container -->
          <div class="flex-grow p-8">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-tourquis-500">{ticket.phase}</span>
                {#if ticket.status === 'completed'}
                  <span class="text-xs text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full">Abgeschlossen</span>
                {:else if ticket.status === 'current'}
                  <span class="text-xs text-green-500 bg-green-500/20 px-3 py-1 rounded-full">Aktuell</span>
                {:else}
                  <span class="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">Coming Soon</span>
                {/if}
              </div>
              <h3 class="mb-4 text-xl {ticket.status === 'completed' ? 'text-gray-500' : 'text-white'}">{ticket.title}</h3>
              <p class="{ticket.status === 'completed' ? 'text-gray-600' : ticket.status === 'coming-soon' ? 'text-gray-400' : 'text-gray-300'} text-sm">{ticket.description}</p>
              {#if ticket.price}
                <p class="mt-2 text-lg font-semibold {ticket.status === 'completed' ? 'text-gray-500' : 'text-tourquis-500'}">{ticket.price} {ticket.currency}</p>
              {/if}
            </div>
            <ul class="mb-6">
              {#each ticket.features as feature}
                <li class="flex items-center mb-4">
                  <svg class="mr-2" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke={ticket.status === 'completed' ? "#4B5563" : ticket.status === 'current' ? "#33cc99" : "#4B5563"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke={ticket.status === 'completed' ? "#4B5563" : ticket.status === 'current' ? "#33cc99" : "#4B5563"} stroke-width="1.5"/>
                  </svg>
                  <span class="{ticket.status === 'completed' ? 'text-gray-600' : ticket.status === 'coming-soon' ? 'text-gray-400' : 'text-gray-300'} text-sm">{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
          
          <!-- Button Container (Always at Bottom) -->
          <div class="p-8 pt-0 text-center">
            {#if ticket.status === 'completed'}
              <span class="inline-block w-full py-4 px-6 text-sm font-medium bg-gray-900 text-gray-600 rounded-full cursor-not-allowed">
                Phase beendet
              </span>
            {:else if ticket.status === 'current'}
              <a class="inline-block w-full py-4 px-6 text-sm  text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200" href={ticket.url || '#tickets'}>
                Zum Ticket
              </a>
            {:else}
              <span class="inline-block w-full py-4 px-6 text-sm font-medium bg-gray-800 text-gray-400 rounded-full cursor-not-allowed">
                Demnächst verfügbar
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
</section>
