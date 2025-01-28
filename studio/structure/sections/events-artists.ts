import type { Section } from '../types'

export const eventsArtistsSection: Section = (S) =>
  S.listItem()
    .title('Events & Artists')
    .child(
      S.list()
        .title('Events & Artists')
        .items([
          // Events Management
          S.listItem()
            .title('Events')
            .child(
              S.list()
                .title('Events Management')
                .items([
                  // Events Overview Page Settings
                  S.listItem()
                    .title('Events Overview Page')
                    .child(
                      S.document()
                        .schemaType('eventPage')
                        .documentId('eventPage')
                    ),

                  S.divider(),
                  
                  // Events List
                  S.documentTypeListItem('event')
                    .title('Events'),
                  
                  // Time Slots
                  S.documentTypeListItem('timeSlot')
                    .title('Time Slots'),
                  
                  // Event Schedules
                  S.documentTypeListItem('eventSchedule')
                    .title('Event Schedules'),

                  S.divider(),

                  // Tickets
                  S.documentTypeListItem('ticket')
                    .title('Tickets')
                ])
            ),
          
          S.divider(),
          
          // Artists
          S.documentTypeListItem('artist')
            .title('Artists')
        ])
    )
