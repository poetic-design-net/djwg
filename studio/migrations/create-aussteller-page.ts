import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Lade Umgebungsvariablen
config({ path: resolve(__dirname, '../../app/.env.production') })

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'kijh3dc6',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-03-28',
  useCdn: false,
})

const defaultContent = {
  _type: 'ausstellerPage',
  title: 'Aussteller werden',
  description: 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!',
  
  // Benefits
  benefits: [
    {
      _type: 'benefit',
      title: 'Direkte Zielgruppe',
      description: 'Erreiche motivierte DJs und Musikbegeisterte direkt vor Ort.'
    },
    {
      _type: 'benefit',
      title: 'Präsentation',
      description: 'Eigener Stand und Präsentationsmöglichkeiten für deine Produkte.'
    },
    {
      _type: 'benefit',
      title: 'Networking',
      description: 'Knüpfe wertvolle Kontakte in der DJ- und Musikbranche.'
    }
  ],

  // Why Partner Section
  whyPartnerSection: {
    _type: 'whyPartnerSection',
    title: 'Warum Aussteller werden?',
    description: 'Als Partner des DJ Workshops profitierst du von unserem starken Netzwerk und direktem Zugang zur DJ-Community.'
  },

  // Exhibitor Info
  exhibitorInfo: {
    _type: 'exhibitorInfo',
    title: 'Ausstellerfläche',
    items: [
      'Professionell ausgestattete Standfläche',
      'Technische Ausstattung nach Bedarf',
      'Optimale Präsentationsmöglichkeiten',
      'Flexible Standgrößen verfügbar'
    ]
  },

  // Marketing Info
  marketingInfo: {
    _type: 'marketingInfo',
    title: 'Marketing & Promotion',
    items: [
      'Präsenz auf unserer Website',
      'Social Media Promotion',
      'Erwähnung in Newsletter',
      'Logo-Präsenz auf Event-Material'
    ]
  },

  // Areas Section
  areasSection: {
    _type: 'areasSection',
    title: 'Unsere Areas',
    description: 'Entdecke die verschiedenen Bereiche des DJ Workshops'
  },

  // Contact Form
  contactForm: {
    _type: 'contactForm',
    title: 'Kontaktiere uns für individuelle Anfragen',
    fields: {
      name: {
        label: 'Name',
        placeholder: 'Dein Name'
      },
      email: {
        label: 'E-Mail',
        placeholder: 'deine@email.de'
      },
      phone: {
        label: 'Telefon',
        placeholder: 'Deine Telefonnummer'
      },
      company: {
        label: 'Firma',
        placeholder: 'Deine Firma'
      },
      message: {
        label: 'Nachricht',
        placeholder: 'Deine Nachricht an uns'
      }
    },
    submitButton: 'Anfrage senden'
  },

  // SEO
  seo: {
    _type: 'seo',
    title: 'Aussteller werden | DJ Workshop',
    description: 'Präsentiere deine Produkte auf unserem Event und erreiche die DJ-Community!',
    keywords: ['Aussteller', 'DJ Workshop', 'Messe', 'Networking', 'DJ Event']
  }
}

async function createAusstellerPage() {
  try {
    console.log('Erstelle Aussteller-Seite...')
    
    // Prüfe ob bereits eine Seite existiert
    const existingPage = await client.fetch('*[_type == "ausstellerPage"][0]')
    
    if (existingPage) {
      console.log('Aussteller-Seite existiert bereits.')
      console.log('ID:', existingPage._id)
      return
    }

    const result = await client.create(defaultContent)
    console.log('Aussteller-Seite erfolgreich erstellt!')
    console.log('ID:', result._id)

  } catch (error) {
    console.error('Fehler beim Erstellen der Aussteller-Seite:', error)
    process.exit(1)
  }
}

// Prüfe Token
if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('❌ Kein SANITY_AUTH_TOKEN gefunden!')
  process.exit(1)
}

createAusstellerPage()