import { createClient, type SanityClient } from '@sanity/client'
import config from '../sanity.config'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

// Lade Umgebungsvariablen aus verschiedenen .env Dateien
const envFiles = [
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../app/.env.production'),
  resolve(__dirname, '../../app/.env'),
]

// Versuche nacheinander die env-Dateien zu laden
envFiles.forEach(file => {
  dotenvConfig({ path: file })
})

// Erstelle Client mit Konfiguration aus sanity.config.ts
const client: SanityClient = createClient({
  projectId: config.projectId,
  dataset: config.dataset || 'production',
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-03-28',
  useCdn: false,
})

async function migrateTickets() {
  try {
    console.log('Lade Tickets...')
    const tickets = await client.fetch(`*[_type == "ticket"]`)

    console.log(`${tickets.length} Tickets gefunden.`)
    const transaction = client.transaction()

    for (const ticket of tickets) {
      if (Array.isArray(ticket.features)) {
        const newFeatures = ticket.features.map((feature: string | { text: string, info?: string }) => {
          // Konvertiere String-Features in das neue Objekt-Format
          if (typeof feature === 'string') {
            return {
              _type: 'feature',
              text: feature,
              // Leeres Info-Feld, kann später ergänzt werden
              info: ''
            }
          }
          // Bei existierenden Feature-Objekten: Stelle sicher, dass _type gesetzt ist
          return {
            _type: 'feature',
            ...feature
          }
        })

        transaction.patch(ticket._id, {
          set: {
            features: newFeatures
          }
        })
        console.log(`Ticket "${ticket.title}" wird aktualisiert...`)
      }
    }

    console.log('Führe Änderungen durch...')
    await transaction.commit()
    console.log('Migration erfolgreich abgeschlossen!')

  } catch (error) {
    console.error('Fehler während der Migration:', error)
    process.exit(1)
  }
}

// Prüfe ob Token vorhanden ist
if (!process.env.SANITY_AUTH_TOKEN) {
  console.error('❌ Kein SANITY_AUTH_TOKEN gefunden!')
  console.error('Token wurde in folgenden Dateien gesucht:')
  envFiles.forEach(file => console.error(`- ${file}`))
  console.error('\nProjekteinstellungen:')
  console.error(`- Project ID: ${config.projectId}`)
  console.error(`- Dataset: ${config.dataset}`)
  process.exit(1)
}

console.log('🚀 Starte Migration...')
console.log(`Project ID: ${config.projectId}`)
console.log(`Dataset: ${config.dataset}`)
migrateTickets()