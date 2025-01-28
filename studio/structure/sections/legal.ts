import type { Section } from '../types'

export const legalSection: Section = (S) =>
  S.listItem()
    .title('Legal')
    .child(
      S.list()
        .title('Legal')
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
    )