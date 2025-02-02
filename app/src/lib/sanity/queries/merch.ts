import groq from 'groq'

export const merchPageQuery = groq`*[_type == "merchPage"][0] {
  hero {
    eyebrow,
    title,
    description,
    backgroundImage {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt,
      hotspot,
      crop
    }
  },
  section {
    eyebrow,
    title,
    description
  },
  "products": products[]-> {
    _id,
    title,
    description,
    features,
    shopUrl,
    "images": images[] {
      asset-> {
        _id,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      alt,
      hotspot,
      crop
    },
    variants[] {
      name,
      price,
      currency,
      shopUrl
    }
  }
}`