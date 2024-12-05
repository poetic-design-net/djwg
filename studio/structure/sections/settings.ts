import type { Section } from '../types'

export const settingsSection: Section = (S) =>
  S.listItem()
    .title('Settings')
    .child(
      S.list()
        .title('Settings')
        .items([
          // Site Settings
          S.listItem()
            .title('Site Settings')
            .child(
              S.document()
                .schemaType('siteSettings')
                .documentId('siteSettings')
            ),

          // Theme
          S.listItem()
            .title('Theme Settings')
            .child(
              S.document()
                .schemaType('themeSettings')
                .documentId('themeSettings')
            ),

          // Navigation
          S.listItem()
            .title('Navigation')
            .child(
              S.list()
                .title('Navigation')
                .items([
                  S.documentTypeListItem('navigation')
                    .title('Menus'),
                  S.listItem()
                    .title('Footer')
                    .child(
                      S.document()
                        .schemaType('footerSettings')
                        .documentId('footerSettings')
                    )
                ])
            ),

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
                    ),
                  S.listItem()
                    .title('Datenschutz')
                    .child(
                      S.document()
                        .schemaType('page')
                        .documentId('datenschutz')
                    ),
                  S.listItem()
                    .title('Impressum')
                    .child(
                      S.document()
                        .schemaType('page')
                        .documentId('impressum')
                    )
                ])
            ),

          // Branding
          S.listItem()
            .title('Branding')
            .child(
              S.documentTypeList('logo')
                .title('Logos')
            )
        ])
    )
