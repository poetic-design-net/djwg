<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { FAQ } from '$lib/sanity/queries';

  export let faqs: FAQ[] = [
    {
      _type: 'faq',
      question: "Brauche ich Vorkenntnisse für die DJ Workshops?",
      answer: "Nein, unsere Workshops sind für alle Levels geeignet. Wir bieten sowohl Einsteiger- als auch fortgeschrittene Kurse an. Die Trainer passen sich individuell an dein Niveau an.",
      category: 'workshop',
      order: 0
    },
    {
      _type: 'faq',
      question: "Welches Equipment wird in den Workshops verwendet?",
      answer: "Wir arbeiten ausschließlich mit professionellem Club-Standard Equipment von Pioneer DJ und Allen & Heath. Du lernst an der gleichen Technik, die auch in Clubs verwendet wird.",
      category: 'equipment',
      order: 1
    },
    {
      _type: 'faq',
      question: "Wie lange dauern die Workshops?",
      answer: "Die Dauer variiert je nach Workshop-Format. Unsere Basis-Workshops gehen einen Tag, während intensive Masterclasses über mehrere Tage stattfinden können. Alle Details findest du in der jeweiligen Event-Beschreibung.",
      category: 'workshop',
      order: 2
    },
    {
      _type: 'faq',
      question: "Bekomme ich ein Zertifikat?",
      answer: "Ja, nach erfolgreichem Abschluss des Workshops erhältst du ein offizielles DJ Workshop Germany Zertifikat, das deine Teilnahme und erlernten Skills bestätigt.",
      category: 'workshop',
      order: 3
    },
    {
      _type: 'faq',
      question: "Kann ich das Equipment auch nach dem Workshop nutzen?",
      answer: "Ja, wir bieten unseren Workshop-Teilnehmern die Möglichkeit, das Equipment für Übungszwecke zu nutzen. Die Details zur Studiobuchung erhältst du während des Workshops.",
      category: 'equipment',
      order: 4
    },
    {
      _type: 'faq',
      question: "Gibt es die Möglichkeit einer individuellen Betreuung?",
      answer: "Ja, neben den Gruppen-Workshops bieten wir auch 1-on-1 Coaching Sessions an. Diese können flexibel nach deinen Bedürfnissen gestaltet werden.",
      category: 'booking',
      order: 5
    }
  ];

  let activeIndex: number | null = null;
  let selectedCategory: string = 'all';

  $: filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  function toggleQuestion(index: number) {
    activeIndex = activeIndex === index ? null : index;
  }

  const categories = [
    { value: 'all', label: 'Alle' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'booking', label: 'Booking' },
    { value: 'general', label: 'Allgemein' }
  ];
</script>

<section class="relative py-20 overflow-hidden">
  <div class="container px-4 mx-auto">
    <div class="mb-20 text-center">
      <span class="inline-block mb-4 text-sm text-green-400 font-medium tracking-tighter">FAQ</span>
      <h2 class="font-heading text-5xl md:text-6xl text-white tracking-tighter">Häufig gestellte Fragen</h2>
    </div>

    <!-- Category Filter -->
    <div class="flex flex-wrap justify-center gap-4 mb-12">
      {#each categories as category}
        <button
          class="px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 {selectedCategory === category.value ? 'bg-green-400 text-black' : 'bg-black/40 text-white border border-gray-800 hover:border-green-500'}"
          on:click={() => {
            selectedCategory = category.value;
            activeIndex = null;
          }}
        >
          {category.label}
        </button>
      {/each}
    </div>

    <div class="max-w-3xl mx-auto">
      {#each filteredFaqs as faq, index}
        <div class="mb-4">
          <button
            class="w-full p-6 bg-black/40 border border-gray-800 rounded-3xl hover:border-green-500 transition-colors duration-300 {activeIndex === index ? 'rounded-b-none' : ''}"
            on:click={() => toggleQuestion(index)}
          >
            <div class="flex items-center justify-between">
              <h3 class="text-xl text-white">{faq.question}</h3>
              <svg
                class="w-6 h-6 text-green-400 transform transition-transform duration-300 {activeIndex === index ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {#if activeIndex === index}
            <div
              class="p-6 bg-black/20 border-x border-b border-gray-800 rounded-b-3xl"
              transition:slide={{ duration: 300, easing: quintOut }}
            >
              <p class="text-gray-300">{faq.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  button {
    text-align: left;
  }
</style>
