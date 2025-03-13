import groq from 'groq'

export const ausstellerPageQuery = groq`
  *[_type == "ausstellerPage" && language == $language][0] {
    title,
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
    whyPartnerSection {
      title,
      description
    },
    pricingSection {
      title,
      description,
      cards[] {
        title,
        price,
        description,
        features[] {
          text,
          info
        }
      }
    },
    contactForm {
      title,
      fields {
        name {
          label,
          placeholder
        },
        email {
          label,
          placeholder
        },
        phone {
          label,
          placeholder
        },
        company {
          label,
          placeholder
        },
        message {
          label,
          placeholder
        }
      },
      submitButton
    },
    seo {
      title,
      description,
      keywords
    }
  }
`