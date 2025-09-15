import type { Section } from '../types';

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
                  
                  // Quick Access to Registration-Enabled Schedules
                  S.listItem()
                    .title('⚡ Quick: Registerable Schedules')
                    .child(
                      S.documentList()
                        .title('All Schedules (Filter by Registration)')
                        .filter('_type == "eventSchedule"')
                        .defaultOrdering([
                          {field: '_createdAt', direction: 'desc'}
                        ])
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

                  // Registration Management - Quick Access
                  S.listItem()
                    .title('📋 Registration Management')
                    .child(
                      S.list()
                        .title('Sessions with Registration')
                        .items([
                          // Sessions with Registration Enabled
                          S.listItem()
                            .title('🎯 Registerable Sessions')
                            .child(
                              S.documentList()
                                .title('Schedules with Registration Enabled')
                                .filter('_type == "eventSchedule"')
                                .defaultOrdering([
                                  {field: '_createdAt', direction: 'desc'}
                                ])
                                .child(scheduleId =>
                                  S.document()
                                    .schemaType('eventSchedule')
                                    .documentId(scheduleId)
                                )
                            ),

                          S.divider(),

                          // All Registrations
                          S.listItem()
                            .title('📝 All Registrations')
                            .child(
                              S.documentList()
                                .title('All Schedule Registrations')
                                .filter('_type == "scheduleRegistration"')
                                .defaultOrdering([
                                  {field: 'createdAt', direction: 'desc'}
                                ])
                            ),

                          // Registrations by Event
                          S.listItem()
                            .title('📊 Registrations by Event')
                            .child(
                              S.documentList()
                                .title('Select Event')
                                .filter('_type == "event"')
                                .defaultOrdering([{field: 'title', direction: 'asc'}])
                                .child(eventId =>
                                  S.documentList()
                                    .title('Event Registrations')
                                    .filter('_type == "scheduleRegistration" && event._ref == $eventId')
                                    .params({ eventId })
                                    .defaultOrdering([
                                      {field: 'dayIndex', direction: 'asc'},
                                      {field: 'stageIndex', direction: 'asc'},
                                      {field: 'itemIndex', direction: 'asc'},
                                      {field: 'createdAt', direction: 'desc'}
                                    ])
                                )
                            ),

                          // Registrations by User
                          S.listItem()
                            .title('👤 Registrations by User')
                            .child(
                              S.documentList()
                                .title('All Registrations')
                                .filter('_type == "scheduleRegistration"')
                                .defaultOrdering([
                                  {field: 'userName', direction: 'asc'},
                                  {field: 'createdAt', direction: 'desc'}
                                ])
                                .child(registrationId =>
                                  S.documentList()
                                    .title('User Registrations')
                                    .filter('_type == "scheduleRegistration" && userId == select($userId, userId)')
                                    .params({
                                      userId: async (parent, context) => {
                                        const doc = await context.getClient({apiVersion: '2021-06-07'}).fetch(
                                          `*[_id == $id][0].userId`,
                                          {id: registrationId}
                                        )
                                        return doc
                                      }
                                    })
                                )
                            ),

                          // Waitlist Management
                          S.listItem()
                            .title('⏳ Waitlist')
                            .child(
                              S.documentList()
                                .title('Waitlist Registrations')
                                .filter('_type == "scheduleRegistration" && status == "waitlist"')
                                .defaultOrdering([
                                  {field: 'createdAt', direction: 'asc'}
                                ])
                            ),
                        ])
                    ),

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
          S.documentTypeListItem('artist'),

          // DJ Award
          S.listItem()
            .title('DJ Award')
            .schemaType('award')
            .child(S.documentTypeList('award').title('DJ Award')),

          // Testimonials
          S.listItem()
            .title('Testimonials')
            .schemaType('testimonial')
            .child(S.documentTypeList('testimonial').title('Testimonials')),
        ])
    )