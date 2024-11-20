<script>
  import { fade } from 'svelte/transition';
</script>

<section class="relative py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="flex flex-wrap -m-8">
      <div class="w-full md:w-1/2 p-8">
        <div class="md:max-w-lg">
          <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Über DJ Workshop Germany</span>
          <h2 class="font-heading mb-6 text-5xl lg:text-6xl text-white tracking-tighter">Deine DJ-Karriere beginnt hier</h2>
          <p class="mb-6 text-xl text-gray-300">Wir sind ein Team aus professionellen DJs und Musikproduzenten, die ihre Leidenschaft für elektronische Musik teilen und weitergeben möchten.</p>
          <p class="mb-8 text-xl text-gray-300">Mit über 20 Jahren Erfahrung in der Club- und Festival-Szene bieten wir dir das perfekte Umfeld, um deine DJ-Skills auf das nächste Level zu bringen.</p>
          <a class="group inline-flex items-center text-lg text-white hover:text-green-400 font-medium transition duration-200" href="/uber-uns">
            <span class="mr-4">Mehr über uns</span>
            <svg class="transform group-hover:rotate-90 transition duration-200" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0195 0.725586L1.51953 11.2256" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12.0195 10.3535V0.725586H2.39156" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </a>
        </div>
      </div>
      <div class="w-full md:w-1/2 p-8">
        <div class="relative mx-auto md:mr-0 max-w-max">
          <img class="absolute -left-8 -top-8 w-28 md:w-auto" src="/nightsable-assets/images/abouts/star.svg" alt="">
          <img class="absolute -right-8 -bottom-8 w-28 md:w-auto" src="/nightsable-assets/images/abouts/star-light.svg" alt="">
          <div class="relative overflow-hidden rounded-3xl">
            <img class="h-96 w-full object-cover transform hover:scale-105 transition duration-500" src="/assets/home_hero.jpg" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
