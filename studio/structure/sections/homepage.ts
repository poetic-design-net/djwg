import type { Section } from '../types'

export const homepageSection: Section = (S) =>
  S.listItem()
    .title('Homepage')
    .child(
      S.document()
        .schemaType('homePage')
        .documentId('homePage')
        .views([
          S.view
            .form()
            .id('content')
            .title('Content'),
          S.view
            .form()
            .id('settings')
            .title('Settings')
        ])
    )
