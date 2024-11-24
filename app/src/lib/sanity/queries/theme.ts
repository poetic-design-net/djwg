import groq from 'groq'

export const themeSettingsQuery = groq`*[_type == "themeSettings"][0] {
  colors {
    red,
    green,
    gray,
    blueGray,
    tourquis
  },
  screens
}`

export interface ThemeSettings {
  colors: {
    red: {
      [key: string]: string
    }
    green: {
      [key: string]: string
    }
    gray: {
      [key: string]: string
    }
    blueGray: {
      [key: string]: string
    }
    tourquis: {
      [key: string]: string
    }
  }
  screens: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
}
