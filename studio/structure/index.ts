import { settingsSection } from './sections/settings'
import { contentSection } from './sections/content'
import { eventsSection } from './sections/events'
import { homepageSection } from './sections/homepage'
import { knowledgeBaseSection } from './sections/knowledgeBase'
import { legalSection } from './sections/legal'
import { navigationSection } from './sections/navigation'
import { teamSection } from './sections/team'

export const myStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Main Content
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              homepageSection(S),
              S.listItem()
                .title('Events')
                .child(
                  S.list()
                    .title('Events')
                    .items([
                      S.listItem()
                        .title('All Events')
                        .child(
                          S.documentList()
                            .title('All Events')
                            .schemaType('event')
                            .filter('_type == "event"')
                        ),
                      S.divider(),
                      eventsSection(S)
                    ])
                ),
              contentSection(S),
              teamSection(S),
              knowledgeBaseSection(S)
            ])
        ),

      // Navigation & Structure
      S.listItem()
        .title('Navigation & Structure')
        .child(
          S.list()
            .title('Navigation & Structure')
            .items([
              navigationSection(S),
              legalSection(S)
            ])
        ),

      // Settings & Configuration
      S.listItem()
        .title('Settings')
        .child(
          S.list()
            .title('Settings')
            .items([
              S.listItem()
                .title('Site Settings')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.listItem()
                .title('Footer Settings')
                .child(
                  S.document()
                    .schemaType('footerSettings')
                    .documentId('footerSettings')
                ),
              S.documentTypeListItem('logo')
                .title('Logos'),
              S.documentTypeListItem('testimonial')
                .title('Testimonials')
            ])
        ),

      S.divider(),

      // Hide default content types in main navigation
      ...S.documentTypeListItems().filter(
        (listItem: any) =>
          ![
            'homePage',
            'event',
            'artist',
            'teamMember',
            'knowledgeBaseItem',
            'navigation',
            'logo',
            'testimonial',
            'siteSettings',
            'footerSettings',
            'media.tag'
          ].includes(listItem.getId())
      )
    ])
