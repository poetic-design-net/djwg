import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'scheduleRegistration',
  title: 'Schedule Registrations',
  type: 'document',
  fields: [
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'eventSchedule',
      title: 'Event Schedule',
      type: 'reference',
      to: [{ type: 'eventSchedule' }]
    }),
    defineField({
      name: 'dayIndex',
      title: 'Day Index',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'stageIndex',
      title: 'Stage Index',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'itemIndex',
      title: 'Item Index',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    }),
    defineField({
      name: 'sessionTitle',
      title: 'Session Title',
      type: 'string',
      description: 'Title of the session for easy reference'
    }),
    defineField({
      name: 'sessionTime',
      title: 'Session Time',
      type: 'string',
      description: 'Time of the session for easy reference'
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'profileId',
      title: 'Profile ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'userName',
      title: 'User Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'userEmail',
      title: 'User Email',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'registrationKey',
      title: 'Registration Key',
      type: 'string',
      description: 'Unique key to prevent duplicate registrations',
      validation: Rule => Rule.required(),
      hidden: true // Hide from UI as it's system-generated
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Waitlist', value: 'waitlist' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'confirmed',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      userName: 'userName',
      sessionTitle: 'sessionTitle',
      sessionTime: 'sessionTime',
      status: 'status',
      eventTitle: 'event.title'
    },
    prepare({ userName, sessionTitle, sessionTime, status, eventTitle }) {
      return {
        title: `${userName} - ${sessionTitle || 'Session'}`,
        subtitle: `${eventTitle || 'Event'} | ${sessionTime || 'Time'} | ${status}`
      };
    }
  }
});