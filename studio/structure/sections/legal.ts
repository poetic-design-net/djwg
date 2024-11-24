import type { Section } from '../types'

export const legalSection: Section = (S) =>
  S.listItem()
    .title('Legal')
    .child(
      S.list()
        .title('Legal')
        .items([
          // Legal Pages
          S.listItem()
            .title('Legal Pages')
            .child(
              S.list()
                .title('Legal Pages')
                .items([
                  S.listItem()
                    .title('AGB')
                    .child(
                      S.document()
                        .schemaType('page')
                        .documentId('agb')
                        .views([
                          S.view
                            .form()
                            .id('content')
                            .title('Content'),
                          S.view
                            .form()
                            .id('seo')
                            .title('SEO')
                        ])
                    ),
                  S.listItem()
                    .title('Datenschutz')
                    .child(
                      S.document()
                        .schemaType('page')
                        .documentId('datenschutz')
                        .views([
                          S.view
                            .form()
                            .id('content')
                            .title('Content'),
                          S.view
                            .form()
                            .id('seo')
                            .title('SEO')
                        ])
                    ),
                  S.listItem()
                    .title('Impressum')
                    .child(
                      S.document()
                        .schemaType('page')
                        .documentId('impressum')
                        .views([
                          S.view
                            .form()
                            .id('content')
                            .title('Content'),
                          S.view
                            .form()
                            .id('seo')
                            .title('SEO')
                        ])
                    )
                ])
            ),

          // Legal Settings
          S.listItem()
            .title('Legal Settings')
            .child(
              S.document()
                .schemaType('siteSettings')
                .documentId('legalSettings')
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
            )
        ])
    )
