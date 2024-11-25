import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { themeSettingsQuery } from '../src/lib/sanity/queries/theme'
import type { ThemeSettings } from '../src/lib/sanity/queries/theme'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('Environment variables loaded:')
console.log('Project ID:', process.env.PUBLIC_SANITY_PROJECT_ID)
console.log('Dataset:', process.env.PUBLIC_SANITY_DATASET)
console.log('API Version:', process.env.PUBLIC_SANITY_API_VERSION)
console.log('Read Token exists:', !!process.env.SANITY_API_READ_TOKEN)

// Initialize Sanity client
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: process.env.PUBLIC_SANITY_API_VERSION || '2024-03-15',
  token: process.env.SANITY_API_READ_TOKEN
})

const defaultSettings: ThemeSettings = {
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

function transformColorObject(colorObj: Record<string, string>) {
  const transformed: Record<string, string> = {}
  Object.entries(colorObj).forEach(([key, value]) => {
    // Convert shadeXXX to XX
    const shade = key.replace('shade', '')
    transformed[shade] = value
  })
  return transformed
}

async function generateTailwindConfig() {
  try {
    console.log('Fetching theme settings from Sanity...')
    console.log('Query:', themeSettingsQuery)

    // Fetch theme settings from Sanity
    const settings = await client.fetch<ThemeSettings>(themeSettingsQuery)
      .catch((error) => {
        console.error('Error fetching from Sanity:', error)
        return defaultSettings
      })

    if (!settings) {
      console.log('No theme settings found in Sanity, using default settings')
    } else {
      console.log('Successfully fetched theme settings from Sanity:', settings)
    }

    const themeSettings = settings || defaultSettings

    // Transform color objects
    const transformedColors = {
      red: transformColorObject(themeSettings.colors.red),
      green: transformColorObject(themeSettings.colors.green),
      gray: transformColorObject(themeSettings.colors.gray),
      blueGray: transformColorObject(themeSettings.colors.blueGray),
      tourquis: transformColorObject(themeSettings.colors.tourquis)
    }

    const bodyBgColor = themeSettings.colors.custom.body
    const bodyTextColor = themeSettings.colors.custom.bodyText

    // Create the Tailwind config
    const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      screens: ${JSON.stringify(themeSettings.screens, null, 2)},
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000',
        white: '#fff',
        red: ${JSON.stringify(transformedColors.red, null, 2)},
        green: ${JSON.stringify(transformedColors.green, null, 2)},
        gray: ${JSON.stringify(transformedColors.gray, null, 2)},
        blueGray: ${JSON.stringify(transformedColors.blueGray, null, 2)},
        tourquis: ${JSON.stringify(transformedColors.tourquis, null, 2)}
      },
      fontFamily: {
        body: ${JSON.stringify(themeSettings.fontFamily.body)},
        heading: ${JSON.stringify(themeSettings.fontFamily.heading)},
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      spacing: {
        '0': '0px',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
        '14': '3.5rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
        px: '1px',
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
      },
      animation: {
        none: 'none',
        spin: 'spin 1s linear infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
      },
      backdropBlur: (theme) => theme('blur'),
      backdropBrightness: (theme) => theme('brightness'),
      backdropContrast: (theme) => theme('contrast'),
      backdropGrayscale: (theme) => theme('grayscale'),
      backdropHueRotate: (theme) => theme('hueRotate'),
      backdropInvert: (theme) => theme('invert'),
      backdropOpacity: (theme) => theme('opacity'),
      backdropSaturate: (theme) => theme('saturate'),
      backdropSepia: (theme) => theme('sepia'),
      backgroundColor: (theme) => ({
        ...theme('colors'),
        body: '${bodyBgColor}',
      }),
      backgroundImage: {
        none: 'none',
        'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
        'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
        'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
        'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
        'gradient-radial-dark': 'radial-gradient(72.20% 78.49% at 49.87% 50.10%, rgba(71, 80, 98, 0.26) 0%, rgba(137, 137, 137, 0.00) 100%)',
        'gradient-radial-dark-light': 'radial-gradient(80.63% 80.22% at 52.97% 50.00%, rgba(71, 80, 98, 0.46) 0%, rgba(137, 137, 137, 0.00) 100%)',
        'gradient-radial-light': 'radial-gradient(90.27% 103.98% at 73.03% 35.14%, rgba(232, 239, 254, 0.26) 0%, rgba(51, 56, 65, 0.13) 100%)',
        'gradient-radial-darker': 'linear-gradient(180deg, #0E0F11 0%, rgba(14, 15, 17, 0.00) 100%)',
        'gradient-radial-darker3': 'linear-gradient(0deg, #0E0F11 0%, rgba(14, 15, 17, 0.00) 100%)',
        'gradient-radial-darker2': 'linear-gradient(270deg, #0E0F11 0%, rgba(14, 15, 17, 0.00) 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, rgba(0, 0, 0, 0.00) 6.77%, #000 100%)',
      },
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '1.875rem',
        '6xl': '3.125rem',
        '7xl': '5rem',
        full: '9999px',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.5rem', { lineHeight: '1' }],
        '7xl': ['3.875rem', { lineHeight: '1' }],
        '8xl': ['4.5rem', { lineHeight: '1' }],
        '9xl': ['5rem', { lineHeight: '1' }],
        '10xl': ['6rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        '10xl': '-4.8px',
        '9xl': '-4px',
        '8xl': '-3.6px',
        '7xl': '-1.86px',
        '6xl': '-1.44px',
        '5xl': '-0.96px',
        '4xl': '-2px',
        '3xl': '-0.64px',
        '2xl': '-0.48px',
        tighter: '-0.026em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      textColor: (theme) => ({
        ...theme('colors'),
        body: '${bodyTextColor}',
      }),
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
