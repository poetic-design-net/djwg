<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';

  export let backgroundImage: string;
  export let title: string = 'NextLevel DJs';
  export let subtitle: string = 'Bereit für die nächste Generation von DJs? Wir auch!';
  export let description: string = 'Bald präsentieren wir dir eine einzigartige Plattform, die das DJ-Game auf ein völlig neues Level hebt.';
  export let footerText: string = 'Bleib dran – es wird legendär! 🎧';
  export let comingSoonText: string = 'Coming Soon';
</script>

<div class="relative overflow-hidden">
  <div class="absolute inset-0 z-0 flex items-center justify-center">
    <div class="w-full max-h-screen relative overflow-hidden">
        <OptimizedImage
        image={backgroundImage}
        alt="DJ Equipment im Hintergrund"
        className="w-full h-full object-cover opacity-20"
        />
      <div class="absolute inset-0 bg-black/10 backdrop-blur-xl"></div>
      </div>
  </div>
    <div class="relative z-10 py-32">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">  {subtitle}</span>
          <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">{title}</h1>
          <p class="text-xl text-white/80 mb-8">{description}</p>
          <p class="text-xl text-white font-medium drop-shadow-lg">
            {footerText}
          </p>
          <span class="inline-block text-green-400 text-lg font-medium tracking-widest drop-shadow-lg uppercase">
            {comingSoonText}
          </span>
        </div>
     
      </div>
    </div>
</div>

