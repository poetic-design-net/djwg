<script lang="ts">
  interface ScheduleItem {
    time: string;
    title: string;
    description?: string;
    instructor?: string;
    icon?: string;
  }

  const demoSchedule: ScheduleItem[] = [
    {
      time: "10:00",
      title: "Check-in & Welcome",
      description: "Registrierung und Begrüßung der Teilnehmer",
      instructor: "DJ Workshop Team",
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      time: "10:30",
      title: "Grundlagen des DJing",
      description: "Einführung in die Kunst des DJings und Überblick über die wichtigsten Techniken",
      instructor: "DJ Master Pro",
      icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
    },
    {
      time: "12:00",
      title: "Mittagspause",
      description: "Networking und Erfahrungsaustausch",
      icon: "M12 8v1m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      time: "13:00",
      title: "Mixing Techniken",
      description: "Fortgeschrittene Mixing-Techniken und praktische Übungen",
      instructor: "DJ Tech Master",
      icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    },
    {
      time: "15:00",
      title: "Performance Workshop",
      description: "Live-Performance Techniken und Crowd Reading",
      instructor: "DJ Stage Pro",
      icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
    },
    {
      time: "17:00",
      title: "Abschluss Session",
      description: "Praktische Anwendung des Gelernten und Feedback",
      instructor: "Alle Trainer",
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  ];

  export let schedule: ScheduleItem[] = demoSchedule;
</script>

<div class="py-20 bg-black/40">
  <div class="container px-4 mx-auto">
    <div class="mb-20 text-center">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Tagesablauf</span>
      <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Schedule</h2>
    </div>

    <div class="relative">
      <!-- Timeline Line -->
      <div class="absolute left-12 md:left-1/2 top-0 w-px h-full bg-gray-800 transform -translate-x-1/2"></div>

      <!-- Schedule Items -->
      <div class="relative space-y-8">
        {#each schedule as item, i}
          <div class="relative flex flex-col md:flex-row items-start md:items-center md:justify-between group">
            <!-- Time -->
            <div class="flex-1 w-full md:w-auto order-2 md:order-none mb-4 md:mb-0 pl-20 md:pl-0 {i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:order-3 md:text-left md:pl-10'}">
              <span class="text-xl text-green-400 font-medium">{item.time}</span>
            </div>

            <!-- Icon -->
            <div class="absolute left-6 md:left-1/2 top-0 md:top-1/2 transform md:-translate-y-1/2 md:-translate-x-1/2 w-12 h-12 md:w-14 md:h-14 bg-black border-4 border-gray-800 rounded-full flex items-center justify-center group-hover:border-green-500 transition-colors duration-300 z-10">
              <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon}></path>
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 w-full md:w-auto order-3 pl-20 md:pl-0 {i % 2 === 0 ? 'md:order-3 md:pl-10' : 'md:pr-10'}">
              <div class="p-4 md:p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-colors duration-300">
                <h3 class="mb-2 text-lg md:text-xl text-white">{item.title}</h3>
                {#if item.description}
                  <p class="mb-2 text-sm md:text-base text-gray-400">{item.description}</p>
                {/if}
                {#if item.instructor}
                  <div class="flex items-center text-sm text-green-400">
                    <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="break-words">{item.instructor}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  /* Ensure smooth transitions */
  .group {
    transition: transform 0.3s ease;
  }

  /* Prevent content overflow on mobile */
  @media (max-width: 768px) {
    .break-words {
      word-break: break-word;
    }
  }
</style>
