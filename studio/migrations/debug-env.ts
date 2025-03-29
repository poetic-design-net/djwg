import { config } from 'dotenv'
import { resolve } from 'path'

// Liste aller möglichen .env Dateien
const envFiles = [
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../.env'),
  resolve(__dirname, '../../app/.env'),
  resolve(__dirname, '../../app/.env.production'),
]

console.log('🔍 Suche nach .env Dateien:\n')

envFiles.forEach(file => {
  console.log(`Prüfe ${file}:`)
  const result = config({ path: file })
  
  if (result.error) {
    console.log('❌ Datei nicht gefunden')
  } else {
    console.log('✅ Datei gefunden')
    if (process.env.SANITY_AUTH_TOKEN) {
      console.log('✅ SANITY_AUTH_TOKEN ist gesetzt')
      console.log(`Token beginnt mit: ${process.env.SANITY_AUTH_TOKEN.substring(0, 10)}...`)
    } else {
      console.log('❌ SANITY_AUTH_TOKEN nicht gefunden in dieser Datei')
    }
  }
  console.log('')
})

console.log('Aktuelle Umgebungsvariablen:')
console.log('SANITY_AUTH_TOKEN:', process.env.SANITY_AUTH_TOKEN ? '✅ Vorhanden' : '❌ Nicht gefunden')