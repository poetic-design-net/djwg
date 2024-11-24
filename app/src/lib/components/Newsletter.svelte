<script lang="ts">
  export let title: string = "Exklusive DJ-Tipps und Tricks. Wöchentlich in deinem Postfach";
  export let description: string = "Schließe dich 10.000 DJs an, erhalte frühzeitig Zugang zu neuen Workshop-Terminen und lerne, wie du deine DJ-Skills auf das nächste Level bringst";
</script>

<div class="container px-4 mx-auto">
  <div class="bg-opacity-30 rounded-6xl">
    <div class="md:max-w-2xl mx-auto text-center px-4">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">DJ Workshop Germany</span>
      <h2 class="font-heading mb-6 text-5xl text-white tracking-5xl">{title}</h2>
      <p class="mb-12 text-gray-300 max-w-lg mx-auto">{description}</p>
    </div>
    <div class="px-4">
      <div class="flex flex-wrap md:max-w-xl mx-auto -m-2">
        <div class="w-full md:flex-1 p-2">
          <div class="md:max-w-xl mx-auto border border-gray-900 focus-within:border-white overflow-hidden rounded-3xl">
            <input class="px-6 py-4 text-gray-300 w-full placeholder-gray-300 outline-none bg-transparent" type="text" placeholder="E-Mail">
          </div>
        </div>
        <div class="w-full md:w-auto p-2"><a class="inline-block px-14 py-4 font-medium tracking-2xl border-2 border-green-400 bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Abonnieren</a></div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Add any additional custom styles here if needed */
</style>
