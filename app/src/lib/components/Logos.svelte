<script lang="ts">
  import { onMount } from 'svelte';
  
  let currentHighlight = 0;
  const totalLogos = 10;

  onMount(() => {
    const interval = setInterval(() => {
      currentHighlight = (currentHighlight + 1) % totalLogos;
    }, 2000);

    return () => clearInterval(interval);
  });
</script>

<div class="container px-4 mx-auto">
  <div class="mb-20 md:max-w-4xl text-center mx-auto">
    <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Unsere Partner</span>
    <h2 class="font-heading text-5xl lg:text-6xl text-white tracking-7xl lg:tracking-8xl">Unterstützt von führenden Marken der DJ-Industrie</h2>
  </div>
  <div class="md:max-w-7xl border border-gray-900 mx-auto mb-12">
    <div class="flex flex-wrap">
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r border-gray-900 logo-container {currentHighlight === 0 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/rbs-white.png" alt="Partner Logo 1">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-r border-gray-900 logo-container {currentHighlight === 1 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/nine-white.png" alt="Partner Logo 2">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r border-gray-900 logo-container {currentHighlight === 2 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/drift-white.png" alt="Partner Logo 3">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-r border-gray-900 logo-container {currentHighlight === 3 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/seek-white.png" alt="Partner Logo 4">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-r lg:border-r-0 border-gray-900 logo-container {currentHighlight === 4 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/deloitte-white.png" alt="Partner Logo 5">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 lg:border-r border-gray-900 logo-container {currentHighlight === 5 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/wise-white.png" alt="Partner Logo 6">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 md:border-r border-gray-900 logo-container {currentHighlight === 6 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/intel-white.png" alt="Partner Logo 7">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b lg:border-b-0 lg:border-r border-gray-900 logo-container {currentHighlight === 7 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/lenovo-white.png" alt="Partner Logo 8">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 border-b md:border-b-0 md:border-r border-gray-900 logo-container {currentHighlight === 8 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/sonder-white.png" alt="Partner Logo 9">
      </div>
      <div class="flex items-center justify-center w-full md:w-1/2 lg:w-1/5 md:border-b-0 border-gray-900 logo-container {currentHighlight === 9 ? 'highlight' : ''}" style="height: 246px;">
        <img src="nightsable-assets/images/logo-clouds/sendle-white.png" alt="Partner Logo 10">
      </div>
    </div>
  </div>
  <div class="text-center">
    <div class="w-auto p-2"><a class="inline-block px-8 py-4 text-white hover:text-black tracking-tighter hover:bg-green-400 border-2 border-white focus:border-green-400 focus:border-opacity-40 hover:border-green-400 focus:ring-4 focus:ring-green-400 focus:ring-opacity-40 rounded-full transition duration-300" href="#">Partner werden</a></div>
  </div>
</div>

<style>
  .logo-container {
    transition: all 0.5s ease-out;
    position: relative;
  }

  .logo-container.highlight {
    background: radial-gradient(circle at center, rgb(178, 230, 0, .02) 0%, transparent 70%);
  }

  .logo-container.highlight::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 1px solid rgb(178, 230, 0);
    animation: pulse 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    20% {
      transform: scale(1.05);
      opacity: 0.9;
    }
    60% {
      transform: scale(1);
      opacity: 0.7;
    }
    100% {
      transform: scale(1.02);
      opacity: 0;
    }
  }

  img {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logo-container.highlight img {
    transform: scale(1.1);
  }
</style>
