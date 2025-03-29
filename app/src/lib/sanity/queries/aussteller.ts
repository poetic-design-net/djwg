import groq from 'groq'

export const ausstellerPageQuery = groq`
  *[_type == "ausstellerPage"][0] {
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
    ticketSection {
      title,
      description,
      tickets[] ->,
      addons[] {
        title,
        description,
        price,
        currency,
        info,
        forPackages
      }
    },
    areasSection {
      title,
      description,
      areas[] ->
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

export const ticketsQuery = groq`
  *[_type == "ticket" && references(*[_type == "ausstellerPage"][0]._id)] {
    _id,
    title,
    price,
    currency,
    description,
    features[] {
      text,
      info
    }
  }
`
