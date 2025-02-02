import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'kijh3dc6',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

const award = {
  _type: 'award',
  _id: 'dj-award-2024',
  hero: {
    heading: 'DJ Award',
    subheading: 'Deine Chance, die Bühne zu erobern',
    eyebrow: 'DJWG Award 2024',
    backgroundImages: [], // Hier müssen die Bilder noch hochgeladen werden
  },
  introText: [
    {
      _type: 'block',
      style: 'normal',
      _key: 'intro1',
      children: [
        {
          _type: 'span',
          _key: 'intro1.0',
          text: 'Die Anmeldung ist denkbar einfach:\n\nNach dem Kauf deines DJ Workshop Germany Tickets kannst du dich für den Award anmelden. Die Teilnahmegebühr beträgt nur 129€ für die Workshop-Teilnehmer*innen.\n\nSchicke uns deinen besten 15 – 30 -minütigen Kategorie Mix + ein kleines Vorstellungsvideo zu (Einsendeschluss 01.10.24, Upload als mp3, DJ Name, Kategorie: Link), der dein Können und deine Vielseitigkeit präsentiert. Unsere Fachjury wird die Einsendungen sorgfältig prüfen und die drei besten Teilnehmer jeder Kategorie auswählen. Jede Teilnehmer*in schafft dadurch ein Alleinstellungsmerkmal und hat die Chance, unter den Top 3 DJs zu landen.\n\nDas Highlight des DJ Awards findet am Montag, den 28. Oktober 2024, während des DJ Workshop Germany statt. Die Finalisten treten in einem mitreißenden Live Battle (je Teilnehmer*in 10 – 15 min) in ihrer Sparte gegeneinander an, und der Gewinner jeder Kategorie kann sich stolz als bester DJ seiner Sparte bezeichnen.\n\nNutze diese einzigartige Gelegenheit, dich zu präsentieren, dich mit anderen talentierten DJs zu messen und vielleicht sogar als Gewinner aus dem Live Battle hervorzugehen. Wir freuen uns darauf, dein Talent beim DJ Workshop Germany zu feiern!\n\nSei dabei und werde ein Teil des aufregenden DJ Awards – deiner Chance, die Bühne zu erobern!'
        }
      ],
      markDefs: []
    }
  ],
  preselectionCriteria: {
    mixSetPercentage: 50,
    onlinePresencePercentage: 50
  },
  evaluationCriteria: [
    {
      _key: 'music',
      title: 'Musikauswahl',
      description: 'Das geschickte Auswählen der passenden Musik zur richtigen Zeit und das Verständnis für die Stimmung des Publikums sind für uns von zentraler Bedeutung.',
      icon: 'vinyl'
    },
    {
      _key: 'mixing',
      title: 'Mixing & Skills',
      description: 'Unsere Jury achtet auf reibungslose Übergänge, kreative Mixtechniken und die Fähigkeit, eine atmosphärische Stimmung durch geschicktes Mischen zu schaffen. Von Scratch-Techniken bis zu beeindruckenden Looping-Fähigkeiten – handwerkliche Fertigkeiten stehen im Mittelpunkt unserer Bewertungen.',
      icon: 'mixer'
    },
    {
      _key: 'creativity',
      title: 'Originalität & Kreativität',
      description: 'Wir honorieren DJs, die ihre eigene Note einbringen, sei es durch einzigartige Remixe, individuelle Stilrichtungen oder innovative Herangehensweisen. Besonderen Wert legen wir auf kreative Köpfe, die über den Mainstream hinausblicken, eigene Produktionen kreieren und das Publikum mit unerwarteten Wendungen überraschen.',
      icon: 'laptop'
    },
    {
      _key: 'performance',
      title: 'Energie & Performance',
      description: 'Die Fähigkeit, die Tanzfläche mit positiver Energie zu füllen und eine mitreißende Bühnenpräsenz zu zeigen, sind für uns entscheidende Elemente.',
      icon: 'microphone'
    },
    {
      _key: 'online',
      title: 'Online Darstellung',
      description: 'Von der Präsenz in den sozialen Medien bis zur Pflege einer professionellen Website – auch die Online-Präsenz und der digitale Auftritt der DJs fließen in unsere Bewertungen ein.',
      icon: 'laptop'
    },
    {
      _key: 'technical',
      title: 'Technisches Verständnis',
      description: 'Wir berücksichtigen auch das technische Verständnis und die Sicherheit im Umgang mit DJ-Equipment.',
      icon: 'controller'
    },
    {
      _key: 'experience',
      title: 'Erfahrung',
      description: 'Unsere Bewertungen nehmen eine Vielzahl von Faktoren in Betracht, einschließlich Erfahrung und weiterer relevanter Aspekte.',
      icon: 'headphones'
    }
  ],
  artistsSection: {
    title: 'DJ Line-Up',
    subtitle: 'Unsere Artists',
    isLineupRevealed: false,
    artists: [] // Hier können später die Artists referenziert werden
  }
};

async function createAward() {
  try {
    console.log('Creating award...');
    const result = await client.createIfNotExists(award);
    console.log('Award created:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error creating award:', error);
    process.exit(1);
  }
}

// Führe die Migration nur aus, wenn ein Token vorhanden ist
if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('Bitte setze den SANITY_WRITE_TOKEN in der Umgebungsvariable');
  process.exit(1);
}

createAward();