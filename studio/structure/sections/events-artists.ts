import type { Section } from '../types';

export const eventsArtistsSection: Section = (S) =>
  S.listItem()
    .title('Events & Artists')
    .child(
      S.list()
        .title('Events & Artists')
        .items([
          S.listItem()
            .title('Events')
            .schemaType('event')
            .child(S.documentTypeList('event').title('Events')),
          S.listItem()
            .title('Artists')
            .schemaType('artist')
            .child(S.documentTypeList('artist').title('Artists')),
          S.listItem()
            .title('DJ Award')
            .schemaType('award')
            .child(S.documentTypeList('award').title('DJ Award')),
          S.listItem()
            .title('Testimonials')
            .schemaType('testimonial')
            .child(S.documentTypeList('testimonial').title('Testimonials')),
        ]),
    )
