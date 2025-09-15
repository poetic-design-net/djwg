interface PreviewProps {
  title?: string;
  days?: Array<any>;
  date?: string;
}

export default {
  name: 'eventSchedule',
  title: 'Event Schedule',
  type: 'document',
  fields: [
    {
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
      description: 'The event this schedule belongs to'
    },
    {
      name: 'isSecret',
      title: 'Secret Schedule',
      type: 'boolean',
      description: 'Hide schedule from public view (only visible to admins)',
      initialValue: true
    },
    {
      name: 'days',
      title: 'Days',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'day',
          fields: [
            {
              name: 'date',
              title: 'Date',
              type: 'date',
              description: 'The date of this schedule day'
            },
            {
              name: 'stages',
              title: 'Stages',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'stage',
                  fields: [
                    {
                      name: 'name',
                      title: 'Stage Name',
                      type: 'string',
                      description: 'Name of the stage (e.g., Main Stage, Workshop Area)'
                    },
                    {
                      name: 'description',
                      title: 'Stage Description',
                      type: 'text',
                      description: 'Brief description of the stage'
                    },
                    {
                      name: 'schedule',
                      title: 'Schedule',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'scheduleItem',
                          fields: [
                            {
                              name: 'time',
                              title: 'Time',
                              type: 'string',
                              description: 'Start time of the event (e.g., 10:00)'
                            },
                            {
                              name: 'title',
                              title: 'Title',
                              type: 'string',
                              description: 'Title of the session'
                            },
                            {
                              name: 'description',
                              title: 'Description',
                              type: 'text',
                              description: 'Description of the session'
                            },
                            {
                              name: 'instructor',
                              title: 'Instructor (Deprecated)',
                              type: 'reference',
                              to: [{ type: 'artist' }],
                              description: '⚠️ DEPRECATED: Use "instructors" field instead',
                              hidden: true
                            },
                            {
                              name: 'instructors',
                              title: 'Artists / Instructors',
                              type: 'array',
                              of: [{
                                type: 'reference',
                                to: [{ type: 'artist' }]
                              }],
                              description: 'Die Artists/Instructors für diese Session (mehrere möglich)',
                              validation: Rule => Rule.max(10)
                            },
                            {
                              name: 'instructorDisplayMode',
                              title: 'Artist Anzeige-Modus',
                              type: 'string',
                              options: {
                                list: [
                                  { title: 'Alle Namen anzeigen', value: 'all' },
                                  { title: 'B2B (Artist 1 b2b Artist 2)', value: 'b2b' },
                                  { title: 'VS (Artist 1 vs Artist 2)', value: 'vs' },
                                  { title: 'Mit Komma getrennt', value: 'comma' },
                                  { title: 'Mit & verbunden', value: 'ampersand' },
                                  { title: 'Nur Hauptact', value: 'main' }
                                ],
                                layout: 'dropdown'
                              },
                              initialValue: 'all',
                              description: 'Wie sollen mehrere Artists angezeigt werden?',
                              hidden: ({ parent }) => !parent?.instructors || parent.instructors.length <= 1
                            },
                            {
                              name: 'icon',
                              title: 'Icon',
                              type: 'string',
                              description: 'SVG path for the icon'
                            },
                            {
                              name: 'allowRegistration',
                              title: 'Allow Registration',
                              type: 'boolean',
                              description: 'Allow users to register for this session',
                              initialValue: false
                            },
                            {
                              name: 'registrationStartTime',
                              title: 'Registration Start Time',
                              type: 'datetime',
                              description: 'When registration opens (shows countdown until this time)',
                              hidden: ({ parent }) => !parent?.allowRegistration
                            },
                            {
                              name: 'maxRegistrations',
                              title: 'Maximum Registrations',
                              type: 'number',
                              description: 'Maximum number of registrations (leave empty for unlimited)',
                              validation: Rule => Rule.min(1)
                            },
                            {
                              name: 'registrationRequired',
                              title: 'Registration Required',
                              type: 'boolean',
                              description: 'Is registration required to attend?',
                              initialValue: false
                            },
                            {
                              name: 'isOpenTable',
                              title: 'Open Table',
                              type: 'boolean',
                              description: 'Dies ist eine Open Table Session - Teilnehmer können sich spontan anmelden',
                              initialValue: false
                            },
                            {
                              name: 'openTableSettings',
                              title: 'Open Table Einstellungen',
                              type: 'object',
                              hidden: ({ parent }) => !parent?.isOpenTable,
                              fields: [
                                {
                                  name: 'autoAcceptRegistrations',
                                  title: 'Automatische Annahme',
                                  type: 'boolean',
                                  description: 'Registrierungen werden automatisch angenommen (keine Warteliste)',
                                  initialValue: true
                                },
                                {
                                  name: 'showRemainingSlots',
                                  title: 'Verbleibende Plätze anzeigen',
                                  type: 'boolean',
                                  description: 'Zeige die Anzahl der verfügbaren Plätze an',
                                  initialValue: true
                                },
                                {
                                  name: 'waitlistEnabled',
                                  title: 'Warteliste aktivieren',
                                  type: 'boolean',
                                  description: 'Erlaube Warteliste wenn alle Plätze belegt sind',
                                  initialValue: false
                                },
                                {
                                  name: 'description',
                                  title: 'Open Table Beschreibung',
                                  type: 'text',
                                  description: 'Zusätzliche Informationen für Open Table Teilnehmer'
                                }
                              ]
                            }
                          ],
                          preview: {
                            select: {
                              title: 'title',
                              time: 'time'
                            },
                            prepare({ title, time }) {
                              return {
                                title: `${time} - ${title}`
                              }
                            }
                          }
                        }
                      ]
                    }
                  ],
                  preview: {
                    select: {
                      name: 'name'
                    },
                    prepare({ name }) {
                      return {
                        title: name || 'Unnamed Stage'
                      }
                    }
                  }
                }
              ]
            }
          ],
          preview: {
            select: {
              date: 'date',
              stages: 'stages'
            },
            prepare({ date, stages }) {
              return {
                title: date ? new Date(date).toLocaleDateString('de-DE') : 'Kein Datum'
              }
            }
          }
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'event.title',
      days: 'days'
    },
    prepare({ title, days }: PreviewProps) {
      return {
        title: title || 'Untitled Event Schedule',
        subtitle: days?.length ? `${days.length} ${days.length === 1 ? 'Tag' : 'Tage'}` : 'Keine Tage gesetzt'
      }
    }
  }
}
