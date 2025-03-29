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

// Demo Areas
const demoAreas = [
  {
    _type: 'area',
    title: 'Messe Area',
    description: 'Zentrale Ausstellungsfläche für Partner und Händler. Hier präsentieren sich die führenden Marken der DJ- und Musikindustrie.'
  },
  {
    _type: 'area',
    title: 'Mixing & Scratching Area',
    description: 'Interaktiver Bereich für Live-Performances und Workshops. Hier können DJs ihr Können zeigen und neue Techniken erlernen.'
  },
  {
    _type: 'area',
    title: 'Marketing & Social Media Area',
    description: 'Networking-Zone für Marketing und Social Media Strategien. Experten teilen ihr Wissen über digitale Präsenz und Branding.'
  },
  {
    _type: 'area',
    title: 'Producing Area',
    description: 'Kreativzone für Musikproduktion und Sound-Design. Hier entstehen neue Beats und Tracks mit modernster Technik.'
  },
  {
    _type: 'area',
    title: 'Panel & Show Area',
    description: 'Bühne für Diskussionen, Präsentationen und Live-Shows. Hier treffen sich Experten und teilen ihre Erfahrungen.'
  },
  {
    _type: 'area',
    title: 'Flohmarkt Area',
    description: 'Marktplatz für gebrauchtes Equipment und Vinyl. Die perfekte Gelegenheit zum Stöbern und Entdecken von Schätzen.'
  }
]

// Demo Tickets für Aussteller
const demoTickets = [
  {
    _type: 'ticket',
    title: 'Sponsor / Supporter',
    description: 'Incl. Social Media Advertising Basic, Homepage Advertising & Merchandise Advertising',
    price: 440,
    currency: 'EUR',
    features: [
      {
        _type: 'feature',
        text: 'Social Media Advertising Basic',
        info: 'Regelmäßige Erwähnung in unseren Stories und Feed-Posts'
      },
      {
        _type: 'feature',
        text: 'Homepage Advertising',
        info: 'Logo-Platzierung auf der Website und Verlinkung zu Ihrer Webpräsenz'
      },
      {
        _type: 'feature',
        text: 'Merchandise Advertising',
        info: 'Logo auf Event-Materialien'
      }
    ],
    buttonText: 'Jetzt Paket buchen',
    url: 'https://eventix.shop/vc4cqfbu',
    phase: 'early',
    status: 'current'
  },
  {
    _type: 'ticket',
    title: 'Exhibitor',
    description: 'Incl. 2 Days Workshop, stand space of 5 qm, 3 Exhibitor Tickets, 2 Free Tickets, Social Media Advertising Basic, Homepage Advertising, Merchandise Advertising',
    price: 970,
    currency: 'EUR',
    features: [
      {
        _type: 'feature',
        text: '2 Days Workshop',
        info: 'Voller Zugang zum zweitägigen Event'
      },
      {
        _type: 'feature',
        text: '5 qm Standfläche',
        info: 'Ausstellerfläche für 2 Tage'
      },
      {
        _type: 'feature',
        text: '3 Exhibitor Tickets',
        info: 'Voller Event-Zugang für 3 Mitarbeiter'
      },
      {
        _type: 'feature',
        text: '2 Free Tickets',
        info: 'Zwei Premium Event-Tickets zum Verschenken'
      },
      {
        _type: 'feature',
        text: 'Marketing Paket Basic',
        info: 'Social Media Advertising, Homepage Advertising, Merchandise Advertising'
      }
    ],
    buttonText: 'Jetzt Paket buchen',
    url: 'https://eventix.shop/vc4cqfbu',
    phase: 'regular',
    status: 'current'
  },
  {
    _type: 'ticket',
    title: 'Exhibitor Plus',
    description: 'Incl. 2 Days Workshop, stand space of 8 qm, 3 Exhibitor Tickets, 2 Free Tickets, Product Presentation Workshop, Logo Pressewand, Social Media Promotion Push, Homepage Advertising, Merchandise Advertising',
    price: 1780,
    currency: 'EUR',
    features: [
      {
        _type: 'feature',
        text: '8 qm Standfläche',
        info: 'Erweiterte Ausstellerfläche für 2 Tage'
      },
      {
        _type: 'feature',
        text: 'Product Presentation Workshop',
        info: 'Möglichkeit zur Produktpräsentation in einem eigenen Workshop'
      },
      {
        _type: 'feature',
        text: 'Logo Pressewand',
        info: 'Ihr Logo auf der offiziellen Pressewand'
      },
      {
        _type: 'feature',
        text: 'Social Media Promotion Push',
        info: 'Verstärkte Social Media Präsenz mit eigenen Highlight-Stories'
      },
      {
        _type: 'feature',
        text: 'Marketing Paket Plus',
        info: 'Erweitertes Marketing-Paket mit Homepage Advertising und Merchandise Advertising'
      },
      {
        _type: 'feature',
        text: '3 Exhibitor & 2 Free Tickets',
        info: 'Voller Event-Zugang für 3 Mitarbeiter plus 2 Tickets zum Verschenken'
      }
    ],
    buttonText: 'Jetzt Paket buchen',
    url: 'https://eventix.shop/vc4cqfbu',
    phase: 'regular',
    status: 'current'
  },
  {
    _type: 'ticket',
    title: 'Area Branding (Exklusiv)',
    description: 'Incl. Area Branding, 2 Days Workshop, stand space of 10 qm, 5 Exhibitor Tickets, 2 Free Tickets Giveaway, Product Presentation Workshop, Social Media Advertising Premium, Homepage Advertising, Merchandise Advertising, Video Content Advertising',
    price: 5000,
    currency: 'EUR',
    features: [
      {
        _type: 'feature',
        text: 'Area Branding - Exklusive Bereiche',
        info: 'Exklusive Namensgebung für Event-Bereiche: Mixing Area by..., PA Area by..., Light Area by...'
      },
      {
        _type: 'feature',
        text: '10 qm Premium Standfläche',
        info: 'Großzügige Ausstellerfläche an Premium-Position'
      },
      {
        _type: 'feature',
        text: '5 Exhibitor & 2 Free Tickets',
        info: 'Fünf Vollzugang-Tickets für Ihr Team plus 2 Tickets zum Verschenken'
      },
      {
        _type: 'feature',
        text: 'Product Presentation Workshop',
        info: 'Exklusive Produktpräsentation in einem eigenen Workshop'
      },
      {
        _type: 'feature',
        text: 'Premium Marketing Paket',
        info: 'Social Media Advertising Premium, Homepage Advertising, Merchandise Advertising, Video Content Advertising'
      },
      {
        _type: 'feature',
        text: 'Featured Partner Status',
        info: 'Premium Website-Platzierung, Hervorgehobene Position in allen Marketingmaterialien'
      },
      {
        _type: 'feature',
        text: 'Video Content',
        info: 'Professionelles Video-Feature, After-Movie Integration, eigene Produkt-Highlights'
      }
    ],
    buttonText: 'Jetzt Paket buchen',
    url: 'https://eventix.shop/vc4cqfbu',
    phase: 'regular',
    status: 'current'
  }
]

async function setupContent() {
  try {
    console.log('Erstelle Demo-Content...')
    
    // 1. Erstelle Areas
    console.log('\nErstelle Areas...')
    const createdAreas = await Promise.all(
      demoAreas.map(area => client.create(area))
    )
    console.log(`✅ ${createdAreas.length} Areas erstellt`)

    // 2. Erstelle Tickets
    console.log('\nErstelle Tickets...')
    const createdTickets = await Promise.all(
      demoTickets.map(ticket => client.create(ticket))
    )
    console.log(`✅ ${createdTickets.length} Tickets erstellt`)

    // 3. Aktualisiere Aussteller-Seite
    console.log('\nAktualisiere Aussteller-Seite...')
    const existingPage = await client.fetch('*[_type == "ausstellerPage"][0]')
    
    if (existingPage) {
      // Update mit Referenzen zu den neuen Areas und Tickets
      await client.patch(existingPage._id)
        .set({
          areasSection: {
            title: 'Unsere Areas',
            description: 'Entdecke die vielfältigen Bereiche der DJ Workshop Germany Messe',
            areas: createdAreas.map(area => ({
              _type: 'reference',
              _ref: area._id
            }))
          },
          ticketSection: {
            title: 'Unsere Ausstellerpakete',
            description: 'Wähle das passende Paket für deine Präsentation auf dem DJ Workshop Germany',
            tickets: createdTickets.map(ticket => ({
              _type: 'reference',
              _ref: ticket._id
            }))
          }
        })
        .commit()
      
      console.log('✅ Aussteller-Seite aktualisiert')
    }

    console.log('\n✨ Setup erfolgreich abgeschlossen!')

  } catch (error) {
    console.error('Fehler beim Setup:', error)
    process.exit(1)
  }
}

// Prüfe Token
if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('❌ Kein SANITY_AUTH_TOKEN gefunden!')
  process.exit(1)
}

setupContent()