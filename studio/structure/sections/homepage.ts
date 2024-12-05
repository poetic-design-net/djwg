import type { Section } from '../types'

export const homepageSection: Section = (S) =>
  S.listItem()
    .title('Homepage')
    .child(
      S.document()
        .schemaType('homePage')
        .documentId('homePage')
    )
