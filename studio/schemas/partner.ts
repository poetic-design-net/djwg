export default {
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Partner Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 3,
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    },
    {
      name: 'website',
      title: 'Website Link',
      type: 'url',
    },
    {
      name: 'showWebsiteWithoutBadge',
      title: 'Website ohne Badge anzeigen',
      type: 'boolean',
      description: 'Wenn aktiviert, wird die Website auch für Nutzer ohne Partner Badge sichtbar sein (aber nicht klickbar)',
      initialValue: false,
    },
    {
      name: 'discountCode',
      title: 'Gutscheincode',
      type: 'string',
    },
    {
      name: 'discountDescription',
      title: 'Gutschein Beschreibung',
      type: 'text',
      rows: 2,
    },
    {
      name: 'email',
      title: 'Kontakt E-Mail',
      type: 'string',
      validation: (Rule: any) => Rule.email(),
    },
    {
      name: 'emailSubject',
      title: 'E-Mail Betreff (vorausgefüllt)',
      type: 'string',
      description: 'Dieser Betreff wird automatisch vorausgefüllt, wenn Nutzer auf die E-Mail klicken',
    },
    {
      name: 'emailBody',
      title: 'E-Mail Text (vorausgefüllt)',
      type: 'text',
      rows: 4,
      description: 'Dieser Text wird automatisch vorausgefüllt, wenn Nutzer auf die E-Mail klicken',
    },
    {
      name: 'isActive',
      title: 'Aktiv',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'orderRank',
      title: 'Reihenfolge',
      type: 'number',
      description: 'Bestimmt die Reihenfolge der Partner (niedrigere Zahlen erscheinen zuerst)',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'logo',
    },
  },
}