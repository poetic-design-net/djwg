import type { Section } from '../types'

export const knowledgeBaseSection: Section = (S) =>
  S.listItem()
    .title('Knowledge Base')
    .child(
      S.list()
        .title('Knowledge Base')
        .items([
          // Articles
          S.listItem()
            .title('Articles')
            .child(
              S.documentTypeList('knowledgeBaseItem')
                .title('Articles')
                .filter('_type == "knowledgeBaseItem"')
                .defaultOrdering([{field: 'title', direction: 'asc'}])
            ),

          // Categories
          S.listItem()
            .title('Categories')
            .child(
              S.documentTypeList('category')
                .title('Categories')
                .filter('_type == "category"')
            ),

          // Featured Articles
          S.listItem()
            .title('Featured Articles')
            .child(
              S.documentTypeList('knowledgeBaseItem')
                .title('Featured Articles')
                .filter('_type == "knowledgeBaseItem" && featured == true')
            ),

          // Settings
          S.listItem()
            .title('KB Settings')
            .child(
              S.document()
                .schemaType('knowledgeBaseItem')
                .documentId('knowledgeBaseSettings')
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
