import groq from 'groq'

export const themeSettingsQuery = groq`*[_type == "themeSettings"][0] {
  colors {
    red,
    green,
    gray,
    blueGray,
    tourquis,
    custom
  },
  screens,
  fontFamily
}`

export interface ThemeSettings {
  colors: {
    red: {
      shade50: string
      shade100: string
      shade200: string
      shade300: string
      shade400: string
      shade500: string
      shade600: string
      shade700: string
      shade800: string
      shade900: string
    }
    green: {
      shade50: string
      shade100: string
      shade200: string
      shade300: string
      shade400: string
      shade500: string
      shade600: string
      shade700: string
      shade800: string
      shade900: string
    }
    gray: {
      shade50: string
      shade100: string
      shade200: string
      shade300: string
      shade400: string
      shade500: string
      shade600: string
      shade700: string
      shade800: string
      shade900: string
    }
    blueGray: {
      shade50: string
      shade100: string
      shade200: string
      shade300: string
      shade400: string
      shade500: string
      shade600: string
      shade700: string
      shade800: string
      shade900: string
    }
    tourquis: {
      shade500: string
    }
    custom: {
      body: string
      bodyText: string
    }
  }
  screens: {
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  fontFamily: {
    body: string[]
    heading: string[]
  }
}
