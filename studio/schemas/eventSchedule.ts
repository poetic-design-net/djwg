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
      initialValue: false
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
                              title: 'Instructor',
                              type: 'reference',
                              to: [{ type: 'artist' }],
                              description: 'The instructor/artist for this session'
                            },
                            {
                              name: 'icon',
                              title: 'Icon',
                              type: 'string',
                              description: 'SVG path for the icon'
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
