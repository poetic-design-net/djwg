import type { Section } from '../types'

export const contentSection: Section = (S) =>
  S.listItem()
    .title('Content')
    .child(
      S.list()
        .title('Content')
        .items([
          S.listItem()
            .title('Homepage')
            .child(S.document().schemaType('homePage').documentId('homePage')),
          S.listItem()
            .title('NextLevel DJs')
            .child(S.document().schemaType('nextLevelDjs').documentId('nextLevelDjs')),
          S.listItem()
            .title('Partner Page')
            .child(S.document().schemaType('partnerPage').documentId('partnerPage')),
          S.listItem()
            .title('About Us')
            .child(S.document().schemaType('aboutUs').documentId('aboutUs')),
          S.listItem()
            .title('Artist Page')
            .child(S.document().schemaType('artistPage').documentId('artistPage')),
          S.listItem()
            .title('Merch Page')
            .child(S.document().schemaType('merchPage').documentId('merchPage')),
          S.listItem()
            .title('Events')
            .child(S.documentTypeList('event')),
          S.listItem()
            .title('Artists')
            .child(S.documentTypeList('artist')),
          S.listItem()
            .title('Blog Posts')
            .child(S.documentTypeList('post')),
          S.divider(),
          S.listItem()
            .title('Pages')
            .child(S.documentTypeList('page')),
          S.listItem()
            .title('Testimonials')
            .child(S.documentTypeList('testimonial')),
        ])
    )
