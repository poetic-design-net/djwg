interface PreviewProps {
  title?: string;
  days?: Array<any>;
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
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
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
        subtitle: days?.length ? `${days.length} days` : 'No days set'
      }
    }
  }
}
