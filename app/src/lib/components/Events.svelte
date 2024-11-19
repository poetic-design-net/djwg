<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  interface Card {
    image: string;
    tag: string;
    title: string;
    description: string;
    dates: string[];
    link: string;
  }

  const cards: Card[] = [
    {
      image: "assets/home_hero_2.jpg",
      tag: "Main Event",
      title: "DJ WORKSHOP GERMANY x headliner academy",
      description: "Ein exklusives zweitägiges Event, bei dem du von den besten DJs der Szene lernen kannst. Tauche ein in die Welt des professionellen DJings mit praktischen Workshops, individuellen Coaching-Sessions und der Möglichkeit, dein Können auf echter Club-Equipment zu demonstrieren. Vernetze dich mit Gleichgesinnten und erhalte wertvolles Feedback von Industry-Profis.",
      dates: ["26.10.2025 - 27.10.2025"],
      link: "/events/headliner-academy-2025"
    },
    {
      image: "nightsable-assets/images/cards/bg-image2.png", 
      tag: "Berlin Event",
      title: "DJ WORKSHOP GERMANY - Berlin",
      description: "Erlebe die pulsierende Berliner DJ-Szene hautnah in diesem intensiven eintägigen Workshop. Lerne von lokalen Legenden, entdecke die einzigartige Club-Kultur Berlins und erhalte exklusive Einblicke in die technischen und künstlerischen Aspekte des DJings. Der Workshop findet in einem der angesagtesten Clubs Berlins statt und bietet dir die perfekte Mischung aus Theorie und Praxis.",
      dates: ["15.3.2025"],
      link: "/events/berlin-2025"
    }
  ];
</script>

<div class="container mx-auto px-4">
  <div class="text-center mb-16">
    <span class="inline-block mb-4 text-sm text-purple-400 font-medium tracking-tighter">Kommende Events</span>
    <h2 class="font-heading mb-6 text-5xl md:text-7xl lg:text-8xl text-white tracking-8xl md:max-w-md mx-auto">DJ Workshop Germany</h2>
    <p class="mb-8 text-gray-300 md:max-w-md mx-auto">Sei dabei bei unseren exklusiven DJ Events in 2025</p>
  </div>

  <div class="flex flex-wrap -mx-4">
    {#each cards as card}
      <div class="w-full sm:w-1/2 px-4 mb-8">
        <div 
          class="h-full flex flex-col bg-black/40 rounded-3xl overflow-hidden border border-gray-800 hover:border-green-500 transition-all duration-300 transform hover:shadow-xl"
          in:fade={{duration: 300, easing: cubicInOut}}
        >
          <!-- Image Container -->
          <div class="relative w-full h-96 overflow-hidden">
            <img 
              class="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition duration-500" 
              src={card.image} 
              alt={card.title}
            >
            <div class="absolute p-6">
              <span class="inline-block rounded-full bg-green-500 px-4 py-2 text-sm text-black font-medium tracking-tighter">{card.tag}</span>
            </div>
          </div>

          <!-- Content Container -->
          <div class="flex flex-col flex-grow p-6">
            <div class="mb-4">
              {#each card.dates as date}
                <span class="inline-block mr-2 text-green-500 font-medium">{date}</span>
              {/each}
            </div>
            
            <h3 class="text-2xl md:text-3xl text-white font-medium tracking-tighter mb-4">{card.title}</h3>
            
            <p class="text-gray-300 mb-8 flex-grow">{card.description}</p>
            
            <div class="mt-auto">
              <a 
                class="inline-block w-full py-4 px-6 text-sm text-black font-medium bg-green-500 hover:bg-green-600 rounded-full transition duration-200 text-center" 
                href={card.link}
              >
                Zum Event
              </a>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
