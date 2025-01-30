export interface SocialMedia {
  platform: string
  url: string
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
}

export interface SiteSettings {
  title: string
  description: string
  contact: ContactInfo
  socialMedia: SocialMedia[]
}

export interface PageData {
  settings: SiteSettings
}