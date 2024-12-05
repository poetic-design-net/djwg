import { contentSection } from './sections/content'
import { homepageSection } from './sections/homepage'
import { settingsSection } from './sections/settings'

export const myStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Homepage
      homepageSection(S),

      // Main Content
      contentSection(S),

      // Settings
      settingsSection(S),

      S.divider(),

      // Hide default content types in main navigation
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            'homePage',
            'page',
            'event',
            'eventSchedule',
            'timeSlot',
            'artist',
            'teamMember',
            'founder',
            'post',
            'knowledgeBaseItem',
            'category',
            'navigation',
            'logo',
            'testimonial',
            'siteSettings',
            'footerSettings',
            'themeSettings',
            'media.tag'
          ].includes(listItem.getId())
      )
    ])
