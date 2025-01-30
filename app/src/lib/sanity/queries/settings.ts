import groq from 'groq'

export const siteSettingsQuery = groq`
*[_type == "siteSettings"][0] {
  title,
  description,
  contact {
    email,
    phone,
    address
  },
  socialMedia[] {
    platform,
    url
  }
}`