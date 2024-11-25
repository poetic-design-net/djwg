import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Initialize Sanity client with write permissions
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: process.env.PUBLIC_SANITY_API_VERSION || '2024-03-15',
  token: process.env.SANITY_API_WRITE_TOKEN // Using write token
})

const themeSettings = {
  _type: 'themeSettings',
  _id: 'themeSettings',
  colors: {
    red: {
      shade50: '#FFF1F1',
      shade100: '#FFDFDF',
      shade200: '#FFC5C5',
      shade300: '#FF9D9D',
      shade400: '#FF6464',
      shade500: '#FF1E1E',
      shade600: '#ED1515',
      shade700: '#C80D0D',
      shade800: '#A50F0F',
      shade900: '#881414',
    },
    green: {
      shade50: '#FDFFE4',
      shade100: '#F9FFC4',
      shade200: '#F1FF90',
      shade300: '#E2FF50',
      shade400: '#CCFF00',
      shade500: '#B2E600',
      shade600: '#8AB800',
      shade700: '#688B00',
      shade800: '#526D07',
      shade900: '#455C0B',
    },
    gray: {
      shade50: '#F6F6F6',
      shade100: '#E7E7E7',
      shade200: '#D1D1D1',
      shade300: '#B0B0B0',
      shade400: '#888888',
      shade500: '#6D6D6D',
      shade600: '#5D5D5D',
      shade700: '#4C4C4C',
      shade800: '#454545',
      shade900: '#3D3D3D',
    },
    blueGray: {
      shade50: '#F4F6F7',
      shade100: '#E4E7E9',
      shade200: '#CBD1D6',
      shade300: '#A7B0B9',
      shade400: '#7B8795',
      shade500: '#606C7A',
      shade600: '#535B67',
      shade700: '#474E57',
      shade800: '#3F434B',
      shade900: '#383C41',
    },
    tourquis: {
      shade500: '#33cc99',
    },
    custom: {
      body: '#0E0F11',
      bodyText: '#fff',
    },
  },
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
  fontFamily: {
    body: [
      'Clash Grotesk',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    heading: [
      'Clash Grotesk',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
  },
}

async function createThemeSettings() {
  try {
    console.log('Creating theme settings document in Sanity...')
    const result = await client.createOrReplace(themeSettings)
    console.log('Theme settings created successfully:', result)
  } catch (error) {
    console.error('Error creating theme settings:', error)
    process.exit(1)
  }
}

createThemeSettings()
