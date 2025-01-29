<script lang="ts">
  interface ScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: {
      name: string;
      role: string;
      image?: string;
    };
    icon?: string;
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

  export let schedule: Day[] = [];

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

  // Alle Zeitslots aus allen Stages und Tagen sammeln
  $: allTimeSlots = schedule.flatMap(day => 
    day.stages.flatMap(stage => 
      stage.schedule.map(item => item.time)
    )
  ).filter((value, index, self) => self.indexOf(value) === index)
  .sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a}`);
    const timeB = new Date(`1970/01/01 ${b}`);
    return timeA.getTime() - timeB.getTime();
  });
</script>

{#if schedule?.length > 0}
  <div class="py-20 bg-black/40">
    <div class="container px-4 mx-auto">
      <div class="mb-20 text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Tagesablauf</span>
        <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Übersicht</h2>
      </div>

      {#each schedule as day}
        <div class="mb-16">
          <h3 class="text-2xl text-white mb-6">{formatDate(day.date)}</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="p-4 text-left text-green-400 font-medium border-b border-gray-800">Zeit</th>
                  {#each day.stages as stage}
                    <th class="p-4 text-left text-green-400 font-medium border-b border-gray-800">{stage.name}</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each allTimeSlots as timeSlot}
                  <tr class="hover:bg-black/20">
                    <td class="p-4 text-white border-b border-gray-800">{timeSlot}</td>
                    {#each day.stages as stage}
                      {@const event = stage.schedule.find(item => item.time === timeSlot)}
                      <td class="p-4 border-b border-gray-800">
                        {#if event}
                          <div class="bg-black/40 p-3 rounded-lg border border-gray-800 hover:border-green-500 transition-all duration-300">
                            <p class="text-white font-medium">{event.title}</p>
                            {#if event.instructor}
                              <p class="text-green-400 text-sm mt-1">{event.instructor.name}</p>
                            {/if}
                          </div>
                        {:else}
                          <span class="text-gray-600">-</span>
                        {/if}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/each}
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
  /* Ensure smooth transitions */
  tr {
    transition: background-color 0.3s ease-out;
  }

  /* Custom scrollbar for the table container */
  .overflow-x-auto {
    scrollbar-width: thin;
    scrollbar-color: #4ade80 #1f2937;
  }

  .overflow-x-auto::-webkit-scrollbar {
    height: 8px;
  }

  .overflow-x-auto::-webkit-scrollbar-track {
    background: #1f2937;
    border-radius: 4px;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background-color: #4ade80;
    border-radius: 4px;
  }
</style>