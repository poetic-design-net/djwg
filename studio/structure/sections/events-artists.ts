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

                  // Tickets by Event
                  S.listItem()
                    .title('Tickets')
                    .child(
                      S.list()
                        .title('Tickets by Event')
                        .items([
                          // All Tickets
                          S.listItem()
                            .title('All Tickets')
                            .child(
                              S.documentList()
                                .title('All Tickets')
                                .filter('_type == "ticket"')
                                .defaultOrdering([
                                  {field: 'event.title', direction: 'asc'},
                                  {field: 'title', direction: 'asc'}
                                ])
                            ),
                          S.divider(),
                          // Tickets by Event
                          S.listItem()
                            .title('By Event')
                            .child(
                              S.documentList()
                                .title('Select Event')
                                .filter('_type == "event"')
                                .defaultOrdering([{field: 'title', direction: 'asc'}])
                                .child(eventId =>
                                  S.documentList()
                                    .title('Tickets')
                                    .filter('_type == "ticket" && event._ref == $eventId')
                                    .params({ eventId })
                                )
                            )
                        ])
                    )
                ])
            ),
          
          S.divider(),
          
          // Artists
          S.documentTypeListItem('artist')
            .title('Artists')
        ])
    )
