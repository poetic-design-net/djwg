import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { themeSettingsQuery } from '../src/lib/sanity/queries/theme'
import type { ThemeSettings } from '../src/lib/sanity/queries/theme'

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false, // We want fresh data
  apiVersion: '2023-05-03'
})

async function generateTailwindConfig() {
  try {
    // Fetch theme settings from Sanity
    const settings = await client.fetch<ThemeSettings>(themeSettingsQuery)

    if (!settings) {
      console.error('No theme settings found in Sanity')
      process.exit(1)
    }

    // Create the Tailwind config
    const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: ${JSON.stringify(settings.screens, null, 2)},
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000',
        white: '#fff',
        red: ${JSON.stringify(settings.colors.red, null, 2)},
        green: ${JSON.stringify(settings.colors.green, null, 2)},
        gray: ${JSON.stringify(settings.colors.gray, null, 2)},
        blueGray: ${JSON.stringify(settings.colors.blueGray, null, 2)},
        tourquis: ${JSON.stringify(settings.colors.tourquis, null, 2)}
      },
      // Preserve existing configuration
      backgroundColor: (theme) => ({
        ...theme('colors'),
        body: '#0E0F11',
      }),
      textColor: (theme) => ({
        ...theme('colors'),
        body: '#fff',
      }),
      // Rest of your existing configuration...
    }
  }
}`

    // Write the config file
    fs.writeFileSync(path.join(process.cwd(), 'tailwind.config.js'), config)
    console.log('✅ Tailwind config successfully generated from Sanity settings')
  } catch (error) {
    console.error('Error generating Tailwind config:', error)
    process.exit(1)
  }
}

generateTailwindConfig()
