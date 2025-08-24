import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'timeSlot',
  title: 'Time Slots',
  type: 'document',
  fields: [
    defineField({
      name: 'startTime',
      title: 'Start Time',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
      validation: Rule => Rule.required().min(15).max(120)
    }),
    defineField({
      name: 'isBlocked',
      title: 'Is Blocked',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'bookings',
      title: 'Bookings',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'string'
          },
          {
            name: 'email',
            title: 'Email',
            type: 'string'
          },
          {
            name: 'userId',
            title: 'User ID',
            type: 'string'
          },
          {
            name: 'profileId',
            title: 'Profile ID',
            type: 'string'
          },
          {
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime'
          }
        ]
      }],
      validation: Rule => Rule.max(2)
    }),
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{ type: 'event' }],
      validation: Rule => Rule.required()
    })
  ],
  preview: {
    select: {
      startTime: 'startTime',
      duration: 'duration',
      bookingsCount: 'bookings.length'
    },
    prepare({ startTime, duration, bookingsCount = 0 }) {
      const date = new Date(startTime);
      return {
        title: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
        subtitle: `${duration}min - ${bookingsCount}/2 slots booked`
      };
    }
  }
});
