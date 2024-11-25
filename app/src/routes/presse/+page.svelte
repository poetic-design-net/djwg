<script lang="ts">
  import { fade } from 'svelte/transition';
  
  // Logo embed code example
  const logoEmbedCode = `<a href="https://djworkshopgermany.de">
  <img src="https://djworkshopgermany.de/static/assets/logo.svg" 
       alt="djworkshopgermany Logo" 
       width="200" 
       height="auto">
</a>`;
</script>

<div class="min-h-screen bg-black">
  <!-- Hero Section -->
  <div class="relative py-20 overflow-hidden">
    <div class="container px-4 mx-auto">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">Presse</span>
        <h1 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">Pressematerial</h1>
        <p class="text-2xl text-white/80 mb-8">Hier finden Sie alle Materialien für Ihre Berichterstattung über DJ Workshop Germany</p>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="container px-4 mx-auto py-20">
    <div class="max-w-4xl mx-auto">
      <!-- Press Kit Section -->
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">Press Kit</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Logo Pack</h3>
            <p class="text-gray-300 mb-4">Hochauflösende Logos in verschiedenen Formaten (SVG, PNG)</p>
            <a href="/static/assets/press/djwg-logos.zip" class="inline-block px-6 py-3 text-black font-medium bg-green-400 hover:bg-green-500 rounded-full transition duration-200">
              Download Logos
            </a>
          </div>
          <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-all duration-300">
            <h3 class="text-2xl text-white mb-4">Bildmaterial</h3>
            <p class="text-gray-300 mb-4">Hochauflösende Fotos und Grafiken für Ihre Berichterstattung</p>
            <a href="/static/assets/press/djwg-images.zip" class="inline-block px-6 py-3 text-black font-medium bg-green-400 hover:bg-green-500 rounded-full transition duration-200">
              Download Bilder
            </a>
          </div>
        </div>
      </div>

      <!-- Logo Embed Section -->
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">Logo einbetten</h2>
        <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl">
          <p class="text-gray-300 mb-6">Kopieren Sie den folgenden Code, um unser Logo auf Ihrer Website einzubinden:</p>
          <div class="relative">
            <pre class="bg-black/60 p-6 rounded-xl text-green-400 overflow-x-auto">{logoEmbedCode}</pre>
            <button 
              class="absolute top-4 right-4 px-4 py-2 text-sm text-black font-medium bg-green-400 hover:bg-green-500 rounded-full transition duration-200"
              on:click={() => {
                navigator.clipboard.writeText(logoEmbedCode);
              }}
            >
              Kopieren
            </button>
          </div>
        </div>
      </div>

      <!-- Brand Guidelines -->
      <div class="mb-20">
        <h2 class="text-4xl text-white mb-6">Brand Guidelines</h2>
        <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl">
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl text-white mb-3">Farben</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-4 rounded-xl bg-green-500">
                  <p class="text-black font-medium">Primary Green</p>
                  <p class="text-black/80">#B2E500</p>
                </div>
                <div class="p-4 rounded-xl bg-black border border-gray-800">
                  <p class="text-white font-medium">Primary Black</p>
                  <p class="text-white/80">#000000</p>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-2xl text-white mb-3">Logo Verwendung</h3>
              <ul class="list-disc list-inside text-gray-300 space-y-2">
                <li>Mindestgröße: 100px Breite</li>
                <li>Ausreichend Freiraum um das Logo (mindestens 20px)</li>
                <li>Keine Verzerrung oder Rotation</li>
                <li>Keine Farbänderungen ohne Genehmigung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div>
        <h2 class="text-4xl text-white mb-6">Pressekontakt</h2>
        <div class="p-8 bg-black/40 border border-gray-800 rounded-3xl">
          <div class="space-y-4">
            <p class="text-white text-xl">Presseanfragen</p>
            <p class="text-gray-300">Für Presseanfragen kontaktieren Sie bitte:</p>
            <p class="text-green-400">presse@djworkshopgermany.de</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
