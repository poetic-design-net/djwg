<script>
  import { fade, fly } from 'svelte/transition';

  const items = [
    {
    title: "Mixing Techniken",
    description: "Lerne die Grundlagen des Mixens und fortgeschrittene Techniken, um nahtlose Übergänge zwischen Tracks zu schaffen.",
    icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
  },
  {
    title: "Beatmatching",
    description: "Meistere die Kunst des Beatmatchings und lerne, wie du Tracks perfekt synchronisierst für nahtlose Übergänge.",
    icon: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
  },
  {
    title: "Crowd Control",
    description: "Entwickle deine Fähigkeiten in der Crowd Control und lerne, wie du die Energie auf der Tanzfläche steuern kannst.",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
  }
  ];
</script>

<div class="relative container px-4 mx-auto">
  <div class="relative p-6 sm:p-12 bg-green-500 border-b bg-gradient-radial-dark  border-blueGray-900 rounded-5xl">
    <div class="flex flex-wrap lg:items-center -m-8">
      <div class="w-full md:w-1/2 p-8 order-2 md:order-1">
        <img class="relative rounded-xl" src="assets/home_hero.jpg" alt="DJ Workshop">
      </div>
      <div class="w-full md:w-1/2 p-8 order-1 md:order-2">
        <div class="md:max-w-md">
          <h2 class="font-heading mb-4 text-5xl lg:text-7xl text-black tracking-5xl lg:tracking-7xl">Werde zum <span class="block">DJ-Profi</span></h2>
          <p class="mb-6 text-black text-xl">Entdecke die Kunst des DJings mit professionellen Workshops für Anfänger und Fortgeschrittene. Von Mixing-Techniken bis zur Crowd Control - wir bringen dich auf das nächste Level.</p>
          <div class="flex flex-wrap items-center -m-2">
            <div class="w-auto p-2">
              <a href="#workshops" class="inline-block px-8 py-4 text-center text-black font-medium tracking-tighter bg-white hover:bg-black/95 hover:text-white border-2 hover:border-black/95 border-white focus:ring-4 focus:ring-green-300 focus:ring-opacity-40 rounded-full transition duration-300">
                Workshops entdecken
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

     

  <div class="flex flex-wrap pt-12 -m-4">
    {#each items as item}
      <div class="w-full md:w-1/3 p-4">
        <div class="p-6 sm:px-10 sm:pt-14 sm:pb-12 h-full bg-gradient-radial-dark border border-gray-900 border-opacity-30 rounded-3xl flex flex-col transition duration-300 ease-in-out transform hover:shadow-xl hover:bg-gradient-to-br hover:border-green-500">
          <svg class="w-8 h-8 mb-6 text-gray-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22" stroke-width="1" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
          </svg>
          <h3 class="mb-6 text-4xl text-white tracking-tighter-xl">{item.title}</h3>
          <p class="mb-6 text-white">{item.description}</p>
          <div class="mt-auto">
            <a class="inline-block" href="#">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.1689 2L2.11268 24" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M24.1689 22.1732V2H3.94413" stroke="white" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
