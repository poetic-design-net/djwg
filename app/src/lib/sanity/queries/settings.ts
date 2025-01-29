import groq from 'groq'

export const getSocialMediaLinks = groq`
*[_type == "siteSettings"][0] {
  "socialMedia": socialMedia[] {
    platform,
    url,
    icon,
    description
  }
}`

export interface SocialMediaLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter'
  url: string
  icon: string
  description?: string
}

export interface SiteSettings {
  socialMedia: SocialMediaLink[]
}