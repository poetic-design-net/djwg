import type { StructureResolver } from 'sanity/structure'

export const myStructure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Homepage
      S.listItem()
        .title('Homepage')
        .child(
          S.document()
            .schemaType('homePage')
            .documentId('homePage')
        ),

      // Content & Pages
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.listItem()
                .title('Über Uns')
                .schemaType('aboutUs')
                .child(
                  S.document()
                    .schemaType('aboutUs')
                    .documentId('aboutUs')
                ),
              S.listItem()
                .title('Blog Posts')
                .schemaType('post')
                .child(S.documentTypeList('post')),
              S.listItem()
                .title('Testimonials')
                .schemaType('testimonial')
                .child(S.documentTypeList('testimonial')),
              S.listItem()
                .title('FAQs')
                .schemaType('faq')
                .child(S.documentTypeList('faq'))
            ])
        ),

      // Knowledge Base
      S.listItem()
        .title('Knowledge Base')
        .child(
          S.list()
            .title('Knowledge Base')
            .items([
              S.listItem()
                .title('Einträge')
                .schemaType('knowledgeBaseItem')
                .child(S.documentTypeList('knowledgeBaseItem')),
              S.listItem()
                .title('Kategorien')
                .schemaType('category')
                .child(S.documentTypeList('category'))
            ])
        ),

      // Events & Termine
      S.listItem()
        .title('Events & Termine')
        .child(
          S.list()
            .title('Events & Termine')
            .items([
              S.listItem()
                .title('Events')
                .schemaType('event')
                .child(S.documentTypeList('event')),
              S.listItem()
                .title('Event Page Settings')
                .schemaType('eventPage')
                .child(
                  S.document()
                    .schemaType('eventPage')
                    .documentId('eventPage')
                ),
              S.listItem()
                .title('Zeitpläne')
                .schemaType('eventSchedule')
                .child(S.documentTypeList('eventSchedule')),
              S.listItem()
                .title('Zeitslots')
                .schemaType('timeSlot')
                .child(S.documentTypeList('timeSlot'))
            ])
        ),

      // Team & Künstler
      S.listItem()
        .title('Team & Künstler')
        .child(
          S.list()
            .title('Team & Künstler')
            .items([
              S.listItem()
                .title('Team Mitglieder')
                .schemaType('teamMember')
                .child(S.documentTypeList('teamMember')),
              S.listItem()
                .title('Künstler')
                .schemaType('artist')
                .child(S.documentTypeList('artist')),
              S.listItem()
                .title('Founder')
                .schemaType('founder')
                .child(S.documentTypeList('founder'))
            ])
        ),

      // Settings
      S.listItem()
        .title('Einstellungen')
        .child(
          S.list()
            .title('Einstellungen')
            .items([
              S.listItem()
                .title('Allgemeine Einstellungen')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.listItem()
                .title('Logos')
                .schemaType('logo')
                .child(S.documentTypeList('logo'))
            ])
        )
    ])
