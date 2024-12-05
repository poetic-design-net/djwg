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
                    .title('Categories'),
                  S.listItem()
                    .title('KB Settings')
                    .child(
                      S.document()
                        .schemaType('knowledgeBaseSettings')
                        .documentId('knowledgeBaseSettings')
                    )
                ])
            ),

          // Team
          S.listItem()
            .title('Team')
            .child(
              S.list()
                .title('Team')
                .items([
                  S.documentTypeListItem('teamMember')
                    .title('Team Members'),
                  S.documentTypeListItem('artist')
                    .title('Artists'),
                  S.documentTypeListItem('founder')
                    .title('Founders'),
                  S.listItem()
                    .title('Team Settings')
                    .child(
                      S.document()
                        .schemaType('aboutUs')
                        .documentId('aboutUs')
                    )
                ])
            ),

          // Events
          S.listItem()
            .title('Events')
            .child(
              S.list()
                .title('Events')
                .items([
                  S.documentTypeListItem('event')
                    .title('Events'),
                  S.documentTypeListItem('eventSchedule')
                    .title('Schedules'),
                  S.documentTypeListItem('timeSlot')
                    .title('Time Slots'),
                  S.listItem()
                    .title('Event Settings')
                    .child(
                      S.document()
                        .schemaType('eventPage')
                        .documentId('eventPage')
                    )
                ])
            ),

          // Testimonials
          S.documentTypeListItem('testimonial')
            .title('Testimonials')
        ])
    )
