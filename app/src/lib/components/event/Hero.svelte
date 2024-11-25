<script lang="ts">
  import { slide } from 'svelte/transition';
  import { generateImageHTML } from '$lib/sanity/image';

  export let event: {
    title: string;
    tag: string;
    subtitle: string;
    date: string;
    location: string;
    locationUrl?: string;
    image: any; // Sanity image type
  };

  let showShareMenu = false;

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  type SharePlatform = 'facebook' | 'x' | 'whatsapp' | 'telegram';

  function share(platform: SharePlatform) {
    const url = window.location.href;
    const text = `Check out ${event.title} - ${event.subtitle}`;

    const shareUrls: Record<SharePlatform, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.share-menu')) {
      showShareMenu = false;
    }
  }

  // Create the picture element HTML
  $: pictureHtml = event.image ? generateImageHTML(
    event.image,
    event.title,
    'w-full h-full object-cover',
  ) : '';
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative h-[100vh] lg:h-[80vh]">
  <!-- Background Image with Gradients -->
  <div class="absolute inset-0 z-0">
    {@html pictureHtml}
    <!-- Combined gradient overlay to prevent multiple layer repaints -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"
      style="transform: translate3d(0, 0, 0)"
    ></div>
  </div>

  <!-- Content Container with fixed positioning to prevent jumping -->
  <div class="absolute inset-x-0 bottom-0 z-[10]">
    <div class="container mx-auto px-4 pb-20 pt-40">
      <div class="max-w-3xl">
        <span class="inline-block px-3 py-1 mb-4 text-sm text-black font-medium tracking-tighter bg-green-400 rounded-full">
          {event.tag}
        </span>
        <span class="block mb-4 text-sm text-green-500 font-medium tracking-tighter">{event.date}</span>
        <h1 class="font-heading mb-6 text-4xl md:text-7xl lg:text-8xl text-white tracking-tighter">{event.title}</h1>
        <p class="text-xl md:text-2xl text-white/80 mb-8">{event.subtitle}</p>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center text-white/80">
            <svg class="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {#if event.locationUrl}
              <a 
                href={event.locationUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="break-words hover:text-green-400 transition-colors duration-300"
              >
                {event.location}
              </a>
            {:else}
              <span class="break-words">{event.location}</span>
            {/if}
          </div>

          <!-- Share Button -->
          <div class="relative share-menu">
            <button
              class="flex items-center justify-center w-10 h-10 rounded-full bg-green-400 hover:bg-green-500 transition-all duration-300 transform hover:scale-110"
              on:click|stopPropagation={toggleShareMenu}
              aria-label="Share event"
            >
              <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
              </svg>
            </button>

            {#if showShareMenu}
              <div
                class="absolute right-0 mt-2 w-48 rounded-xl bg-black border border-gray-800 shadow-xl z-[110]"
                transition:slide={{ duration: 200 }}
              >
                <div class="py-2">
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('facebook')}
                  >
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('x')}
                  >
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('whatsapp')}
                  >
                    <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    class="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center space-x-3"
                    on:click|stopPropagation={() => share('telegram')}
                  >
                    <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                    </svg>
                    <span>Telegram</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
