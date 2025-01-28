import type { Section } from '../types'

export const contentSection: Section = (S) =>
  S.listItem()
    .title('Content')
    .child(
      S.list()
        .title('Content')
        .items([
          // Pages
          S.documentTypeListItem('page')
            .title('Pages'),
          
          // Blog
          S.documentTypeListItem('post')
            .title('Blog Posts'),

          S.divider(),

          // FAQ
          S.documentTypeListItem('faq')
            .title('FAQ'),
          
          // Testimonials
          S.documentTypeListItem('testimonial')
            .title('Testimonials'),

          // About Us
          S.listItem()
            .title('About Us')
            .child(
              S.document()
                .schemaType('aboutUs')
                .documentId('aboutUs')
            )
        ])
    )
