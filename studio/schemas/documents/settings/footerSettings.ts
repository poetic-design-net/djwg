export default {
  name: 'footerSettings',
  title: 'Footer Settings',
  type: 'document',
  preview: {
    select: {
      title: 'title'
    },
    prepare() {
      return {
        title: 'Footer Settings'
      }
    }
  },
  fields: [
    {
      name: 'columns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'column',
          fields: [
            {
              name: 'title',
              title: 'Column Title',
              type: 'string'
            },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'text',
                      title: 'Link Text',
                      type: 'string'
                    },
                    {
                      name: 'url',
                      title: 'URL',
                      type: 'string',
                      validation: (Rule: any) => Rule.required()
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Plattform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'Twitter', value: 'twitter'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'TikTok', value: 'tiktok'}
                ]
              }
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule: any) => Rule.required()
            }
          ]
        }
      ]
    },
    {
      name: 'bottomText',
      title: 'Footer Text (bottom)',
      type: 'text',
      rows: 2,
      description: 'Text der ganz unten im Footer erscheint (z.B. Copyright)'
    },
    {
      name: 'logo',
      title: 'Footer Logo',
      type: 'image',
      options: {
        hotspot: true
      }
    }
  ]
}
