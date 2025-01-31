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


          // Navigation & Footer
          S.listItem()
            .title('Navigation & Footer')
            .child(
              S.list()
                .title('Navigation & Footer')
                .items([
                  S.documentTypeListItem('navigation')
                    .title('Navigation Menus'),
                  S.listItem()
                    .title('Footer Settings')
                    .child(
                      S.document()
                        .schemaType('footerSettings')
                        .documentId('footerSettings')
                    )
                ])
            ),

          S.divider(),

          // Header Settings
          S.listItem()
            .title('Header Settings')
            .child(
              S.document()
                .schemaType('headerSettings')
                .documentId('headerSettings')
            ),

          S.divider(),

          // Branding & Logos
          S.listItem()
            .title('Branding & Logos')
            .child(
              S.documentTypeList('logo')
                .title('Logos')
            )
        ])
    )
