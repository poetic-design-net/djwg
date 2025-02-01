import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'kijh3dc6',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

const courses = [
  {
    _type: 'djCourse',
    title: 'DJ Grundlagen Masterclass',
    description: 'Lerne die fundamentalen Techniken des DJings von Grund auf.',
    level: 'beginner',
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: '0bd0013cdc9cb0376257cff92ec29aea30fdcce7'
      }
    },
    prerequisites: ['Keine Vorkenntnisse erforderlich'],
    chapters: [
      {
        title: 'Equipment & Setup',
        lessons: [
          {
            title: 'DJ Equipment kennenlernen',
            description: 'Eine umfassende Einführung in die DJ-Ausrüstung.',
            videoUrl: 'https://example.com/video1.mp4',
            duration: '15:30',
            chapters: [
              { title: 'Mixer Überblick', timestamp: 120 },
              { title: 'Plattenspieler & CDJs', timestamp: 360 },
              { title: 'Kopfhörer & Monitoring', timestamp: 600 }
            ]
          },
          {
            title: 'Korrekte Verkabelung',
            description: 'Setup deines DJ-Equipments.',
            videoUrl: 'https://example.com/video2.mp4',
            duration: '12:45'
          }
        ]
      },
      {
        title: 'Mixing Basics',
        lessons: [
          {
            title: 'Beatmatching verstehen',
            description: 'Die Grundlagen des Beatmatchings.',
            videoUrl: 'https://example.com/video3.mp4',
            duration: '20:15'
          }
        ]
      }
    ]
  },
  {
    _type: 'djCourse',
    title: 'Advanced Mixing Techniken',
    description: 'Erweitere deine DJ-Skills mit fortgeschrittenen Mixing-Techniken.',
    level: 'intermediate',
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'af8c4016fda1912eb1a33157bfd2b49796e3dba5'
      }
    },
    prerequisites: ['Grundkenntnisse im Beatmatching', 'Verständnis von DJ-Equipment'],
    chapters: [
      {
        title: 'Harmonic Mixing',
        lessons: [
          {
            title: 'Musiktheorie für DJs',
            description: 'Verstehe Tonarten und harmonisches Mixing.',
            videoUrl: 'https://example.com/video4.mp4',
            duration: '25:00',
            chapters: [
              { title: 'Grundlagen der Tonarten', timestamp: 180 },
              { title: 'Das Camelot Wheel', timestamp: 480 },
              { title: 'Praktische Übungen', timestamp: 900 }
            ]
          }
        ]
      },
      {
        title: 'EQ & Effekte',
        lessons: [
          {
            title: 'Kreatives EQ-Mixing',
            description: 'Fortgeschrittene EQ-Techniken.',
            videoUrl: 'https://example.com/video5.mp4',
            duration: '18:30'
          }
        ]
      }
    ]
  },
  {
    _type: 'djCourse',
    title: 'Pro Performance Masterclass',
    description: 'Meistere fortgeschrittene Performance-Techniken für Club-Sets.',
    level: 'advanced',
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: '046755f9449be5e5bdb6c71c2be0b5e5702a8c12'
      }
    },
    prerequisites: ['Fortgeschrittene Mixing-Kenntnisse', 'Erfahrung mit Effekten'],
    chapters: [
      {
        title: 'Advanced Performance',
        lessons: [
          {
            title: 'Live Remixing Techniken',
            description: 'Kreiere einzigartige Live-Remixe.',
            videoUrl: 'https://example.com/video6.mp4',
            duration: '30:00',
            chapters: [
              { title: 'Loops & Cues', timestamp: 240 },
              { title: 'Acapella Mixing', timestamp: 720 },
              { title: 'Live Effekte', timestamp: 1200 }
            ]
          }
        ]
      },
      {
        title: 'Crowd Reading',
        lessons: [
          {
            title: 'Energiefluss im Club',
            description: 'Lerne die Crowd zu lesen und zu steuern.',
            videoUrl: 'https://example.com/video7.mp4',
            duration: '22:15'
          }
        ]
      }
    ]
  }
];

async function createCourses() {
  for (const course of courses) {
    try {
      const result = await client.create(course);
      console.log(`Kurs erstellt: ${result.title}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Kurses:', error);
    }
  }
}

// Führe die Migration nur aus, wenn ein Token vorhanden ist
if (!process.env.SANITY_WRITE_TOKEN) {
  console.error('Bitte setze den SANITY_WRITE_TOKEN in der Umgebungsvariable');
  process.exit(1);
}

createCourses().catch(console.error);