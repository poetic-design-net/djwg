// Script to seed exhibition data in Sanity
// Run with: node scripts/seedExhibitionData.js

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from app directory
dotenv.config({ path: path.resolve(__dirname, '../../app/.env') })

const client = createClient({
  projectId: 'kijh3dc6',
  dataset: 'production',
  apiVersion: '2024-02-28',
  token: process.env.VITE_SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const halls = [
  {
    _type: 'exhibitionHall',
    name: 'Haupthalle',
    hallId: 'A',
    dimensions: {
      width: 800,
      height: 600,
    },
    isSecret: false,
    order: 1,
  },
  {
    _type: 'exhibitionHall',
    name: 'Nebenhalle',
    hallId: 'B',
    dimensions: {
      width: 600,
      height: 400,
    },
    isSecret: false,
    order: 2,
  },
]

const exhibitors = [
  {
    _type: 'exhibitor',
    company: 'DJ TechPro GmbH',
    slug: { current: 'dj-techpro', _type: 'slug' },
    category: 'DJ Equipment',
    description: 'Professionelle DJ-Ausrüstung und Zubehör',
    isPremium: true,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'SoundMaster AG',
    slug: { current: 'soundmaster', _type: 'slug' },
    category: 'Audio Equipment',
    description: 'Hochwertige Audiotechnik für Events',
    isPremium: false,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'LightShow Systems',
    slug: { current: 'lightshow', _type: 'slug' },
    category: 'Lichttechnik',
    description: 'Innovative Beleuchtungslösungen',
    isPremium: true,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'EventSupply24',
    slug: { current: 'eventsupply24', _type: 'slug' },
    category: 'Event Zubehör',
    description: 'Alles für Ihr Event',
    isPremium: false,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'ProAudio Berlin',
    slug: { current: 'proaudio-berlin', _type: 'slug' },
    category: 'Audio Equipment',
    description: 'Professionelle Audiolösungen',
    isPremium: false,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'VJ Solutions',
    slug: { current: 'vj-solutions', _type: 'slug' },
    category: 'Video Equipment',
    description: 'Video- und Projektionstechnik',
    isPremium: true,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'Party Rental Express',
    slug: { current: 'party-rental', _type: 'slug' },
    category: 'Event Zubehör',
    description: 'Vermietung von Event-Equipment',
    isPremium: false,
    isSecret: false,
  },
  {
    _type: 'exhibitor',
    company: 'Digital DJ Academy',
    slug: { current: 'dj-academy', _type: 'slug' },
    category: 'Bildung',
    description: 'DJ-Kurse und Workshops',
    isPremium: false,
    isSecret: false,
  },
]

async function seedData() {
  try {
    console.log('Starting to seed exhibition data...')
    
    // Create halls
    console.log('Creating halls...')
    const createdHalls = []
    for (const hall of halls) {
      const result = await client.create(hall)
      createdHalls.push(result)
      console.log(`Created hall: ${hall.name}`)
    }
    
    // Create exhibitors
    console.log('Creating exhibitors...')
    const createdExhibitors = []
    for (const exhibitor of exhibitors) {
      const result = await client.create(exhibitor)
      createdExhibitors.push(result)
      console.log(`Created exhibitor: ${exhibitor.company}`)
    }
    
    // Create stands with references
    console.log('Creating stands...')
    const stands = [
      // Haupthalle Stände
      {
        _type: 'exhibitionStand',
        standNumber: 'A01',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[0]._id },
        position: { x: 50, y: 50 },
        size: { width: 120, height: 80 },
        status: 'occupied',
        standType: 'premium',
        price: 2500,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A02',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[1]._id },
        position: { x: 200, y: 50 },
        size: { width: 80, height: 80 },
        status: 'occupied',
        standType: 'standard',
        price: 1500,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A03',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[2]._id },
        position: { x: 350, y: 50 },
        size: { width: 100, height: 100 },
        status: 'occupied',
        standType: 'premium',
        price: 2200,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A04',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[3]._id },
        position: { x: 500, y: 50 },
        size: { width: 60, height: 60 },
        status: 'occupied',
        standType: 'standard',
        price: 1200,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A05',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[4]._id },
        position: { x: 50, y: 200 },
        size: { width: 80, height: 60 },
        status: 'occupied',
        standType: 'standard',
        price: 1400,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A06',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[5]._id },
        position: { x: 180, y: 200 },
        size: { width: 100, height: 80 },
        status: 'occupied',
        standType: 'premium',
        price: 2000,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A07',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        position: { x: 320, y: 200 },
        size: { width: 70, height: 70 },
        status: 'available',
        standType: 'standard',
        price: 1300,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A08',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        position: { x: 450, y: 200 },
        size: { width: 90, height: 70 },
        status: 'reserved',
        standType: 'standard',
        price: 1600,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A09',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[6]._id },
        position: { x: 50, y: 350 },
        size: { width: 150, height: 100 },
        status: 'occupied',
        standType: 'premium',
        price: 3000,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A10',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        position: { x: 250, y: 350 },
        size: { width: 100, height: 100 },
        status: 'available',
        standType: 'standard',
        price: 1800,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A11',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        position: { x: 400, y: 350 },
        size: { width: 80, height: 100 },
        status: 'available',
        standType: 'standard',
        price: 1600,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'A12',
        hall: { _type: 'reference', _ref: createdHalls[0]._id },
        exhibitor: { _type: 'reference', _ref: createdExhibitors[7]._id },
        position: { x: 530, y: 350 },
        size: { width: 80, height: 80 },
        status: 'occupied',
        standType: 'standard',
        price: 1500,
        isSecret: false,
      },
      // Nebenhalle Stände
      {
        _type: 'exhibitionStand',
        standNumber: 'B01',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 50, y: 50 },
        size: { width: 100, height: 80 },
        status: 'available',
        standType: 'standard',
        price: 1200,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'B02',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 200, y: 50 },
        size: { width: 80, height: 80 },
        status: 'available',
        standType: 'standard',
        price: 1000,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'B03',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 350, y: 50 },
        size: { width: 90, height: 80 },
        status: 'reserved',
        standType: 'standard',
        price: 1100,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'B04',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 50, y: 200 },
        size: { width: 120, height: 100 },
        status: 'available',
        standType: 'premium',
        price: 1800,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'B05',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 220, y: 200 },
        size: { width: 100, height: 100 },
        status: 'available',
        standType: 'standard',
        price: 1400,
        isSecret: false,
      },
      {
        _type: 'exhibitionStand',
        standNumber: 'B06',
        hall: { _type: 'reference', _ref: createdHalls[1]._id },
        position: { x: 380, y: 200 },
        size: { width: 80, height: 100 },
        status: 'available',
        standType: 'standard',
        price: 1200,
        isSecret: false,
      },
    ]
    
    for (const stand of stands) {
      await client.create(stand)
      console.log(`Created stand: ${stand.standNumber}`)
    }
    
    console.log('✅ Successfully seeded all exhibition data!')
    
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()