<script lang="ts">
  import OptimizedImage from '$lib/components/OptimizedImage.svelte';

  export let backgroundImage: string;
  export let title: string = 'NextLevel DJs';
  export let subtitle: string = 'Bereit für die nächste Generation von DJs? Wir auch!';
  export let description: string = 'Bald präsentieren wir dir eine einzigartige Plattform, die das DJ-Game auf ein völlig neues Level hebt.';
  export let footerText: string = 'Bleib dran – es wird legendär! 🎧';
  export let comingSoonText: string = 'Coming Soon';
</script>

<div class="relative py-24 flex items-center justify-center bg-black overflow-hidden">
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
  
  <div class="relative z-10 px-4 py-16 sm:px-6 lg:px-8 text-center">
    <div class="max-w-4xl mx-auto">
      <div class="inline-block mb-12">
        <div class="w-24 h-[3px] bg-green-400 mx-auto"></div>
      </div>
      
      <h1 class="text-5xl sm:text-7xl font-medium text-white mb-12 tracking-tight drop-shadow-lg uppercase">
        {title}
      </h1>
      
      <p class="text-2xl sm:text-3xl text-white mb-12 leading-tight drop-shadow-lg max-w-3xl mx-auto">
        {subtitle}
        <br />
        {description}
      </p>
      
      <div class="space-y-6">
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