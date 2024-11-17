<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let isOpen = false;
</script>

<div class="{isOpen ? 'block' : 'hidden'} fixed top-0 left-0 bottom-0 w-4/6 sm:max-w-xs z-50">
  <button on:click={() => dispatch('close')} class="fixed inset-0 bg-black opacity-60"></button>
  <nav class="relative z-10 px-9 pt-8 h-full bg-black overflow-y-auto">
    <div class="flex flex-wrap justify-between h-full">
      <div class="w-full">
        <div class="flex items-center justify-between -m-2">
          <div class="w-auto p-2">
            <a class="inline-block" href="/">
              <img class="" src="assets/logo.svg" alt="">
            </a>
          </div>
          <div class="w-auto p-2">
            <button on:click={() => dispatch('close')} class="inline-block text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-center py-16 w-full">
        <ul>
          <li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Home</a></li>
          <li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">About us</a></li>
          <li class="mb-8 text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Wallet</a></li>
          <li class="text-white font-medium hover:text-opacity-90 tracking-tighter"><a href="/">Blog</a></li>
        </ul>
      </div>
      <div class="flex flex-col justify-end w-full pb-8">
        <a class="inline-block px-8 py-4 text-center text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="/">Get in touch</a>
      </div>
    </div>
  </nav>
</div>
