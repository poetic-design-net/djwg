import groq from 'groq'

export const partnerPageQuery = groq`
  *[_type == "partnerPage"][0] {
    title,
    subtitle,
    description,
    benefits[] {
      title,
      description
    },
    exhibitorInfo {
      title,
      items
    },
    marketingInfo {
      title,
      items
    },
    seo {
      title,
      description,
      keywords
    }
  }
`

export const artistPageQuery = groq`
  *[_type == "artistPage"][0] {
    title,
    subtitle,
    description,
    benefits[] {
      title,
      description
    },
    experienceLevels[] {
      value,
      label
    },
    formSettings {
      title,
      successMessage
    },
    seo {
      title,
      description,
      keywords
    }
  }
`