import type { Section } from '../types'

export const settingsSection: Section = (S) =>
  S.listItem()
    .title('Settings')
    .child(
      S.list()
        .title('Settings')
        .items([
          // General Settings
          S.listItem()
            .title('General Settings')
            .child(
              S.document()
                .schemaType('siteSettings')
                .documentId('siteSettings')
                .views([
                  S.view
                    .form()
                    .id('main')
                    .title('Main Settings'),
                  S.view
                    .form()
                    .id('seo')
                    .title('SEO')
                ])
            ),

          // Layout & Design
          S.listItem()
            .title('Layout & Design')
            .child(
              S.list()
                .title('Layout & Design')
                .items([
                  S.documentTypeListItem('logo')
                    .title('Logos'),
                  S.listItem()
                    .title('Footer')
                    .child(
                      S.document()
                        .schemaType('footerSettings')
                        .documentId('footerSettings')
                    ),
                  S.listItem()
                    .title('Tailwind')
                    .child(
                      S.document()
                        .id('themeSettings')
                        .schemaType('themeSettings')
                        .documentId('themeSettings')
                        .views([
                          S.view
                            .form()
                            .title('Colors'),
                          S.view
                            .form()
                            .title('Screen Breakpoints'),
                          S.view
                            .form()
                            .title('Font Families')
                        ])
                    )
                ])
            ),

          // Content Components
          S.listItem()
            .title('Content Components')
            .child(
              S.list()
                .title('Content Components')
                .items([
                  S.documentTypeListItem('testimonial')
                    .title('Testimonials'),
                  S.documentTypeListItem('navigation')
                    .title('Navigation Menus')
                ])
            )
        ])
    )
