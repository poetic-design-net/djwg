import type { Section } from '../types'

export const contentSection: Section = (S) =>
  S.listItem()
    .title('Pages')
    .child(
      S.list()
        .title('Pages')
        .items([
          // Static Pages
          S.listItem()
            .title('Static Pages')
            .child(
              S.list()
                .title('Static Pages')
                .items([
                  S.documentTypeListItem('page')
                    .title('Standard Pages'),
                  S.listItem()
                    .title('Legal Pages')
                    .child(
                      S.list()
                        .title('Legal Pages')
                        .items([
                          S.documentListItem()
                            .id('agb')
                            .title('AGB')
                            .schemaType('page'),
                          S.documentListItem()
                            .id('datenschutz')
                            .title('Datenschutz')
                            .schemaType('page'),
                          S.documentListItem()
                            .id('impressum')
                            .title('Impressum')
                            .schemaType('page')
                        ])
                    )
                ])
            ),

          // Dynamic Content
          S.listItem()
            .title('Dynamic Content')
            .child(
              S.list()
                .title('Dynamic Content')
                .items([
                  S.documentTypeListItem('post')
                    .title('Blog Posts'),
                  S.documentTypeListItem('artist')
                    .title('Artists'),
                  S.documentTypeListItem('teamMember')
                    .title('Team Members')
                ])
            ),

          // Knowledge Base
          S.listItem()
            .title('Knowledge Base')
            .child(
              S.list()
                .title('Knowledge Base')
                .items([
                  S.documentTypeListItem('knowledgeBaseItem')
                    .title('Articles'),
                  S.documentTypeListItem('category')
                    .title('Categories')
                ])
            )
        ])
    )
