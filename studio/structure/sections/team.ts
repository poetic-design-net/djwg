import type { Section } from '../types'

export const teamSection: Section = (S) =>
  S.listItem()
    .title('Team')
    .child(
      S.list()
        .title('Team')
        .items([
          // Team Members
          S.listItem()
            .title('Team Members')
            .child(
              S.documentTypeList('teamMember')
                .title('Team Members')
                .filter('_type == "teamMember"')
            ),

          // Artists
          S.listItem()
            .title('Artists')
            .child(
              S.documentTypeList('artist')
                .title('Artists')
                .filter('_type == "artist"')
            ),

          // Founders
          S.listItem()
            .title('Founders')
            .child(
              S.documentTypeList('founder')
                .title('Founders')
                .filter('_type == "founder"')
            ),

          // Team Settings
          S.listItem()
            .title('Team Settings')
            .child(
              S.document()
                .schemaType('aboutUs')
                .documentId('aboutUs')
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
