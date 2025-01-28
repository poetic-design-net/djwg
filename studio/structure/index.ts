import { contentSection } from './sections/content'
import { eventsArtistsSection } from './sections/events-artists'
import { homepageSection } from './sections/homepage'
import { knowledgeBaseSection } from './sections/knowledge-base'
import { legalSection } from './sections/legal'
import { settingsSection } from './sections/settings'
import { teamSection } from './sections/team'

export const myStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Homepage
      homepageSection(S),

      S.divider(),

      // Content
      contentSection(S),

      // Events & Artists
      eventsArtistsSection(S),

      // Knowledge Base
      knowledgeBaseSection(S),

      // Team
      teamSection(S),

      S.divider(),

      // Settings
      settingsSection(S),

      // Legal
      legalSection(S),

      S.divider(),

      // Hide default content types in main navigation
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            'homePage',
            'page',
            'post',
            'event',
            'eventSchedule',
            'timeSlot',
            'eventPage',
            'artist',
            'teamMember',
            'founder',
            'knowledgeBaseItem',
            'category',
            'navigation',
            'logo',
            'testimonial',
            'faq',
            'aboutUs',
            'siteSettings',
            'footerSettings',
            'themeSettings',
            'knowledgeBaseSettings',
            'media.tag'
          ].includes(listItem.getId())
      )
    ])
