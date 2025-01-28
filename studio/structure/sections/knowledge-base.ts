import type { Section } from '../types'

export const knowledgeBaseSection: Section = (S) =>
  S.listItem()
    .title('Knowledge Base')
    .child(
      S.list()
        .title('Knowledge Base')
        .items([
          S.documentTypeListItem('knowledgeBaseItem')
            .title('Articles'),
          S.documentTypeListItem('category')
            .title('Categories'),
          S.listItem()
            .title('Settings')
            .child(
              S.document()
                .schemaType('knowledgeBaseSettings')
                .documentId('knowledgeBaseSettings')
            )
        ])
    )