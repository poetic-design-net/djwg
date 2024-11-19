<script lang="ts">
  import EventDetail from '$lib/components/EventDetail.svelte';
  import { useQuery } from '@sanity/svelte-loader';
  import type { PageData } from './$types';

  export let data: PageData;
  const artists = useQuery(data.artists);
  $: artistsArray = $artists?.data || [];

  const event = {
    title: "DJ WORKSHOP GERMANY - Berlin",
    subtitle: "Ein Tag in der Hauptstadt der elektronischen Musik",
    description: "Erlebe die pulsierende Berliner DJ-Szene hautnah in diesem einzigartigen Workshop. Berlin ist nicht nur die Hauptstadt Deutschlands, sondern auch das Epizentrum der elektronischen Musikkultur. In diesem intensiven eintägigen Workshop lernst du von Berliner DJ-Legenden, entdeckst die einzigartige Club-Kultur der Stadt und erhältst exklusive Einblicke in die technischen und künstlerischen Aspekte des DJings.",
    date: "15.3.2025",
    location: "Kreuzberg, Berlin",
    image: "/nightsable-assets/images/cards/bg-image2.png",
    features: [
      "Workshop in einem legendären Berliner Club",
      "Hands-on Training mit Club-Standard Equipment",
      "Einblicke in die Berliner Techno-Szene",
      "Tipps und Tricks von lokalen DJ-Legenden",
      "Networking mit der Berliner Club-Szene",
      "Exklusive Behind-the-Scenes Club Tour",
      "Praktische Übungen an verschiedenen Setup-Varianten",
      "Gemeinsamer Clubbesuch am Abend (optional)"
    ],
    highlights: [
      {
        title: "Berliner Expertise",
        description: "Lerne von DJs, die die Berliner Szene geprägt haben",
        icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      },
      {
        title: "Club Location",
        description: "Workshop in einem der angesagtesten Clubs Berlins",
        icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
      },
      {
        title: "Techno Culture",
        description: "Tauche ein in die Geschichte und Kultur der Berliner Techno-Szene",
        icon: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
      },
      {
        title: "Szene-Kontakte",
        description: "Vernetze dich mit aktiven Playern der Berliner Club-Szene",
        icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      }
    ],
    gallery: [
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero_2.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero_2.jpg",
      "/nightsable-assets/images/cards/bg-image2.png",
      "/assets/home_hero.jpg"
    ],
    locationDetails: {
      name: "Geheimer Club Location",
      description: "Einer der legendärsten Techno-Clubs Berlins wird dein Klassenzimmer sein. Mit seiner industriellen Atmosphäre, dem weltbekannten Soundsystem und der einzigartigen Geschichte ist dieser Ort der perfekte Rahmen für deinen Workshop.",
      image: "/nightsable-assets/images/cards/bg-image2.png"
    },
    isLocationSecret: true,
    isArtistsSecret: true
  };
</script>

<EventDetail {event} artists={artistsArray} />
