import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  orderings: [
    {
      title: 'Menu Order',
      name: 'menuOrder',
      by: [{ field: 'sortOrder', direction: 'asc' }]
    }
  ],
  initialValue: {
    type: 'megamenu',
    sortOrder: 100
  },
  fields: [
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Niedrigere Zahlen erscheinen zuerst im Menü'
    }),
    defineField({
      name: 'type',
      title: 'Navigation Type',
      type: 'string',
      options: {
        list: [
          { title: 'Mega Menu', value: 'megamenu' },
          { title: 'Direct Link', value: 'direct' }
        ]
      }
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string'
    }),
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          { title: 'Page Reference', value: 'page' },
          { title: 'Direct Link', value: 'direct' }
        ]
      },
      hidden: ({ parent }) => parent?.type !== 'direct'
    }),
    defineField({
      name: 'pageLink',
      title: 'Link to Page',
      description: 'Select a page to link to',
      type: 'reference',
      to: [{ type: 'page' }],
      hidden: ({ parent }) => parent?.type !== 'direct' || parent?.linkType !== 'page'
    }),
    defineField({
      name: 'directLink',
      title: 'Direct Link',
      type: 'string',
      description: 'Enter a direct URL (e.g., /merch, /award, https://external-site.com)',
      hidden: ({ parent }) => parent?.type !== 'direct' || parent?.linkType !== 'direct'
    }),
    defineField({
      name: 'sectionId',
      title: 'Section ID',
      type: 'string',
      description: 'Optional: ID der Section die angesteuert werden soll',
      hidden: ({ parent }) => parent?.type !== 'direct'
    }),
    defineField({
      name: 'featured',
      title: 'Featured Content',
      type: 'object',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
      fields: [{
        name: 'title',
        title: 'Title',
        type: 'string'
      }, {
        name: 'description',
        title: 'Description',
        type: 'text'
      }, {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true
        }
      }, {
        name: 'link',
        title: 'Link',
        type: 'string'
      }, {
        name: 'linkType',
        title: 'Link Type',
        type: 'string',
        options: {
          list: [
            { title: 'Anchor Link', value: 'anchor' },
            { title: 'Page Link', value: 'page' }
          ]
        }
      }]
    }),
    defineField({
      name: 'columns',
      title: 'Menu Columns',
      type: 'array',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
      of: [{
        type: 'object',
        fields: [{
          name: 'title',
          title: 'Column Title',
          type: 'string'
        }, {
          name: 'items',
          title: 'Menu Items',
          type: 'array',
          of: [{
            type: 'object',
            fields: [{
              name: 'label',
              title: 'Label',
              type: 'string'
            }, {
              name: 'link',
              title: 'Link',
              type: 'string'
            }, {
              name: 'linkType',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Anchor Link', value: 'anchor' },
                  { title: 'Page Link', value: 'page' }
                ]
              }
            }]
          }]
        }]
      }]
    }),
    defineField({
      name: 'quickLinks',
      title: 'Quick Links',
      type: 'array',
      hidden: ({ parent }) => parent?.type !== 'megamenu',
      of: [{
        type: 'object',
        fields: [{
          name: 'label',
          title: 'Label',
          type: 'string'
        }, {
          name: 'link',
          title: 'Link',
          type: 'string'
        }, {
          name: 'linkType',
          title: 'Link Type',
          type: 'string',
          options: {
            list: [
              { title: 'Anchor Link', value: 'anchor' },
              { title: 'Page Link', value: 'page' }
            ]
          }
        }]
      }]
    })
  ]
})
