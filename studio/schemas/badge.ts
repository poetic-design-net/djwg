export default {
  name: 'badge',
  title: 'Badge',
  type: 'document',
  fields: [
    {
      name: 'supabaseId',
      title: 'Supabase UUID',
      type: 'string',
      description: 'Die UUID des Badges in Supabase (z.B. 3003110f-3664-4a05-b183-955f5f3f7785)',
      validation: (Rule: any) => Rule.required().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
    },
    {
      name: 'name',
      title: 'Name',
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
      name: 'orderRank',
      title: 'Order',
      type: 'number',
      description: 'Used to determine the order of badges (lower numbers appear first)',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'style',
      title: 'Style',
      type: 'object',
      fields: [
        {
          name: 'customColor',
          title: 'Custom Color',
          type: 'string',
          description: 'HEX color code (e.g., #FF0000 for red)',
          validation: (Rule: any) => Rule.regex(/^#[0-9A-Fa-f]{6}$/),
        },
        {
          name: 'borderStyle',
          title: 'Border Style',
          type: 'string',
          options: {
            list: [
              { title: 'Solid', value: 'solid' },
              { title: 'Dashed', value: 'dashed' },
              { title: 'Double', value: 'double' },
            ],
          },
        },
        {
          name: 'variant',
          title: 'Variant',
          type: 'string',
          options: {
            list: [
              { title: 'Gold', value: 'gold' },
              { title: 'Silver', value: 'silver' },
              { title: 'Bronze', value: 'bronze' },
              { title: 'Custom', value: 'custom' },
            ],
          },
        }
      ],
    },
    {
      name: 'permissions',
      title: 'Permissions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'resource',
              title: 'Resource',
              type: 'string',
              options: {
                list: [
                  { title: 'Premium Content', value: 'premium_content' },
                  { title: 'Member Area', value: 'member_area' },
                  { title: 'Special Events', value: 'special_events' },
                ],
              },
            },
            {
              name: 'action',
              title: 'Action',
              type: 'string',
              options: {
                list: [
                  { title: 'Read', value: 'read' },
                  { title: 'Write', value: 'write' },
                  { title: 'Delete', value: 'delete' },
                ],
              },
            }
          ],
        }
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'description',
      media: 'icon',
    },
  },
}
