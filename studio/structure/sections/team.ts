import type { Section } from '../types'

export const teamSection: Section = (S) =>
  S.listItem()
    .title('Team')
    .child(
      S.list()
        .title('Team')
        .items([
          S.documentTypeListItem('teamMember')
            .title('Team Members'),
          S.documentTypeListItem('founder')
            .title('Founders')
        ])
    )