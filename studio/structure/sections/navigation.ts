import type { Section } from '../types'

export const navigationSection: Section = (S) =>
  S.listItem()
    .title('Navigation')
    .child(
      S.list()
        .title('Navigation')
        .items([
          // Main Navigation
          S.listItem()
            .title('Main Navigation')
            .child(
              S.documentTypeList('navigation')
                .title('Navigation Menus')
                .filter('_type == "navigation"')
            ),

          // Footer Navigation
          S.listItem()
            .title('Footer')
            .child(
              S.document()
                .schemaType('footerSettings')
                .documentId('footerSettings')
                .views([
                  S.view
                    .form()
                    .id('main')
                    .title('Main Settings'),
                  S.view
                    .form()
                    .id('navigation')
                    .title('Navigation')
                ])
            ),

          // Menu Items
          S.listItem()
            .title('Menu Items')
            .child(
              S.list()
                .title('Menu Items')
                .items([
                  S.documentTypeListItem('page')
                    .title('Pages'),
                  S.documentTypeListItem('event')
                    .title('Events'),
                  S.documentTypeListItem('post')
                    .title('Blog Posts'),
                  S.documentTypeListItem('knowledgeBaseItem')
                    .title('Knowledge Base')
                ])
            )
        ])
    )
