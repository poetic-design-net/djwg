<script lang="ts">
  import EventDetail from '$lib/components/EventDetail.svelte';
  import { useQuery } from '@sanity/svelte-loader';
  import type { PageData } from './$types';

  export let data: PageData;
  const artists = useQuery(data.artists);
  $: artistsArray = $artists?.data || [];

  const event = {
    title: "DJ WORKSHOP GERMANY x headliner academy",
    subtitle: "Das exklusive zweitägige DJ-Event des Jahres 2025",
    description: "Tauche ein in die Welt des professionellen DJings mit einem intensiven zweitägigen Workshop der Extraklasse. In Zusammenarbeit mit der renommierten headliner academy bieten wir dir eine einzigartige Gelegenheit, dein DJ-Handwerk auf das nächste Level zu bringen. Von fortgeschrittenen Mixing-Techniken bis hin zu Live-Performance-Skills - hier erhältst du das komplette Paket für deinen Erfolg als DJ.",
    date: "26.10.2025 - 27.10.2025",
    location: "headliner academy, München",
    image: "/assets/home_hero_2.jpg",
    features: [
      "Intensives Training an professionellem Club-Equipment",
      "Workshops mit international erfolgreichen DJs",
      "Individuelle Coaching-Sessions",
      "Networking mit Gleichgesinnten und Industry-Profis",
      "Exklusive Einblicke in die Club- und Festival-Szene",
      "Zertifizierung durch die headliner academy",
      "Afterparty mit der Möglichkeit zum Live-Auftritt",
      "Umfangreiches Begleitmaterial und Online-Ressourcen"
    ],
    highlights: [
      {
        title: "Pro Equipment",
        description: "Training an aktueller Club-Standard Technik von Pioneer DJ und Allen & Heath",
        icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
      },
      {
        title: "Pro Trainer",
        description: "Lerne von DJs mit jahrelanger Club- und Festival-Erfahrung",
        icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      },
      {
        title: "Live Performance",
        description: "Übe und perfektioniere deine Performance in realer Club-Atmosphäre",
        icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      },
      {
        title: "Networking",
        description: "Baue wertvolle Kontakte in der DJ- und Club-Szene auf",
        icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      }
    ],
    gallery: [
      "/assets/home_hero_2.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero_2.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero.jpg",
      "/nightsable-assets/images/cards/bg-image2.png"
    ],
    locationDetails: {
      name: "headliner academy",
      description: "Die headliner academy ist eine der modernsten DJ-Schulen Deutschlands. Ausgestattet mit State-of-the-Art Equipment und einer Club-ähnlichen Atmosphäre bietet sie die perfekte Umgebung für deine DJ-Ausbildung.",
      image: "/assets/home_hero_2.jpg"
    },
    isLocationSecret: false,
    isArtistsSecret: true
  };
</script>

<EventDetail {event} artists={artistsArray} />
