<script>
  import MobileMenu from './MobileMenu.svelte';
  let mobileNavOpen = false;
</script>

<div class="container px-4 mx-auto">
  <div class="flex items-center justify-between pt-10 pb-4 -m-2">
    <div class="w-auto p-2">
      <div class="flex flex-wrap items-center">
        <div class="w-auto">
          <a class="relative z-10 inline-block" href="/">
            <img class="w-32 -mt-5" src="/assets/logo.svg" alt="">
          </a>
        </div>
      </div>
    </div>
    <div class="w-auto p-2">
      <div class="flex flex-wrap items-center">
        <div class="w-auto hidden lg:block">
          <ul class="flex items-center mr-12 font-heading">
            <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter "><a href="/">Home</a></li>
            <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter "><a href="/events">Events</a></li>
            <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/about">About us</a></li>
            <li class="mr-12 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/join">Mitmachen</a></li>
            <li class="text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/feedback">Feedback</a></li>
          </ul>
        </div>
        <div class="w-auto hidden lg:block">
          <div class="inline-block">
            <a class="inline-block font-heading font-light px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="/tickets">Tickets</a>
          </div>
        </div>
        <div class="w-auto lg:hidden">
          <button on:click={() => mobileNavOpen = !mobileNavOpen} class="relative z-10 inline-block">
            <svg class="text-green-500" width="51" height="51" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" rx="28" fill="currentColor"></rect>
              <path d="M37 32H19M37 24H19" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<MobileMenu 
  isOpen={mobileNavOpen} 
  on:close={() => mobileNavOpen = false}
/>

<img class="absolute top-0 left-0" src="/nightsable-assets/images/headers/layer-blur.svg" alt="">
