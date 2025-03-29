/**
 * Migrations-Skript zum Hinzufügen von Addons für die Aussteller-Seite
 * 
 * Ausführen mit:
 * node -r esbuild-register studio/migrations/addons.ts
 */

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

// Demo Addons für Aussteller
const addons = [
  {
    _type: 'addon',
    _id: 'addon.standspace',
    title: 'Extra Stand Space',
    description: '1 qm - 140€ inkl. MwSt',
    price: 140,
    currency: 'EUR',
    info: 'Erweitern Sie Ihre Präsentationsfläche, Flexible Gestaltungsmöglichkeiten, Stromversorgung und Grundausstattung inklusive, Ideal für große Produktpräsentationen',
    forPackages: 'Für Exhibitor & Area Branding'
  },
  {
    _type: 'addon',
    _id: 'addon.socialmedia',
    title: 'Social Media Promotion Push',
    description: '240€ inkl. MwSt',
    price: 240,
    currency: 'EUR',
    info: 'Zusätzliche Social Media Kampagne, Dedizierte Story-Highlights, Produkt-Feature Posts, Gesteigerte Online-Präsenz',
    forPackages: 'Für Exhibitor & Area Branding'
  },
  {
    _type: 'addon',
    _id: 'addon.exhibitorticket',
    title: 'Extra Exhibitor Ticket',
    description: '50€ inkl. MwSt pro Ticket (max. 3)',
    price: 50,
    currency: 'EUR',
    info: 'Zusätzlicher Mitarbeiter-Zugang, Voller Event-Zugang, Zugang zu allen Bereichen und Workshops',
    forPackages: 'Für Exhibitor & Area Branding'
  },
  {
    _type: 'addon',
    _id: 'addon.videocontent',
    title: 'Extra Video Content Advertising',
    description: '380€ inkl. MwSt',
    price: 380,
    currency: 'EUR',
    info: 'Zusätzliche Video-Produktion, Eigene Produkt-Präsentationen, Integration in Event-Highlights, Social Media Distribution',
    forPackages: 'Für Exhibitor & Area Branding'
  }
]

async function setupAddons() {
  try {
    console.log('Erstelle Addons für die Aussteller-Seite...')

    // Prüfe, ob das Schema für Addons existiert
    console.log('\nErstelle temporäres Schema für Addons...')
    try {
      await client.createIfNotExists({
        _id: 'addon',
        _type: 'document',
        name: 'addon',
        title: 'Addon',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string'
          },
          {
            name: 'description',
            title: 'Description',
            type: 'string'
          },
          {
            name: 'price',
            title: 'Price',
            type: 'number'
          },
          {
            name: 'currency',
            title: 'Currency',
            type: 'string'
          },
          {
            name: 'info',
            title: 'Info',
            type: 'string'
          },
          {
            name: 'forPackages',
            title: 'For Packages',
            type: 'string'
          }
        ]
      })
      console.log('✅ Temporäres Schema erstellt')
    } catch (error) {
      console.log('⚠️ Schema konnte nicht erstellt werden, fahre fort...')
    }
    
    // 1. Erstelle Addons
    console.log('\nErstelle Addons...')
    const createdAddons = await Promise.all(
      addons.map(async addon => {
        try {
          // Versuche zuerst zu aktualisieren, falls es bereits existiert
          await client.createOrReplace(addon)
          return addon
        } catch (error) {
          console.error(`Fehler beim Erstellen von Addon ${addon.title}:`, error)
          throw error
        }
      })
    )
    console.log(`✅ ${createdAddons.length} Addons erstellt`)
    
    // 2. Aktualisiere Aussteller-Seite
    console.log('\nAktualisiere Aussteller-Seite...')
    const existingPage = await client.fetch('*[_type == "ausstellerPage"][0]')
    
    if (existingPage) {
      // Hole aktuelle ticketSection
      const ticketSection = existingPage.ticketSection || {}
      
      // Update mit den neuen Addons
      await client.patch(existingPage._id)
        .set({
          ticketSection: {
            ...ticketSection,
            addons: createdAddons.map(addon => ({
              title: addon.title,
              description: addon.description,
              price: addon.price,
              currency: addon.currency,
              info: addon.info,
              forPackages: addon.forPackages
            }))
          }
        })
        .commit()
      
      console.log('✅ Aussteller-Seite aktualisiert')
    } else {
      console.error('❌ Keine Aussteller-Seite gefunden!')
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

setupAddons()