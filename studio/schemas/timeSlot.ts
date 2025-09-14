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
      name: 'isOpenTable',
      title: 'Open Table',
      type: 'boolean',
      description: 'Dies ist ein Open Table Slot - Teilnehmer können sich spontan anmelden',
      initialValue: false
    }),
    defineField({
      name: 'maxParticipants',
      title: 'Maximale Teilnehmer',
      type: 'number',
      description: 'Maximale Anzahl der Teilnehmer für diesen Open Table Slot',
      validation: Rule => Rule.min(1).max(50),
      hidden: ({ parent }) => !parent?.isOpenTable,
      initialValue: 10
    }),
    defineField({
      name: 'openTableSettings',
      title: 'Open Table Einstellungen',
      type: 'object',
      hidden: ({ parent }) => !parent?.isOpenTable,
      fields: [
        {
          name: 'title',
          title: 'Open Table Titel',
          type: 'string',
          description: 'Titel für diesen Open Table Slot'
        },
        {
          name: 'description',
          title: 'Beschreibung',
          type: 'text',
          description: 'Beschreibung für Open Table Teilnehmer'
        },
        {
          name: 'autoAcceptRegistrations',
          title: 'Automatische Annahme',
          type: 'boolean',
          description: 'Registrierungen werden automatisch angenommen',
          initialValue: true
        },
        {
          name: 'showRemainingSlots',
          title: 'Verbleibende Plätze anzeigen',
          type: 'boolean',
          description: 'Zeige die Anzahl der verfügbaren Plätze',
          initialValue: true
        },
        {
          name: 'waitlistEnabled',
          title: 'Warteliste aktivieren',
          type: 'boolean',
          description: 'Erlaube Warteliste wenn alle Plätze belegt sind',
          initialValue: false
        }
      ]
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
      validation: Rule => Rule.custom((bookings, context) => {
        const parent = context.parent as any;
        const maxParticipants = parent?.isOpenTable ? parent?.maxParticipants || 10 : 2;
        const bookingCount = bookings?.length || 0;

        if (bookingCount > maxParticipants) {
          return `Maximum ${maxParticipants} Buchungen erlaubt`;
        }
        return true;
      })
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
      bookingsCount: 'bookings.length',
      isOpenTable: 'isOpenTable',
      maxParticipants: 'maxParticipants',
      openTableSettings: 'openTableSettings'
    },
    prepare({ startTime, duration, bookingsCount = 0, isOpenTable, maxParticipants, openTableSettings }) {
      const date = new Date(startTime);
      const maxSlots = isOpenTable ? (maxParticipants || 10) : 2;
      const tableType = isOpenTable ? `Open Table: ${openTableSettings?.title || 'Open Table'}` : 'Standard Slot';

      return {
        title: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
        subtitle: `${duration}min - ${bookingsCount}/${maxSlots} belegt - ${tableType}`
      };
    }
  }
});
