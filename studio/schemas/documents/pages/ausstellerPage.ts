import { defineType } from 'sanity'

export default defineType({
  name: 'ausstellerPage',
  title: 'Aussteller Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string'
          },
          {
            name: 'description',
            title: 'Description',
            type: 'text'
          }
        ]
      }]
    },
    {
      name: 'whyPartnerSection',
      title: 'Why Partner Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text'
        }
      ]
    },
    {
      name: 'exhibitorInfo',
      title: 'Exhibitor Information',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [{type: 'string'}]
        }
      ]
    },
    {
      name: 'marketingInfo',
      title: 'Marketing Information',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'items',
          title: 'Items',
          type: 'array',
          of: [{type: 'string'}]
        }
      ]
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text'
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{type: 'string'}]
        }
      ]
    },
    {
      name: 'pricingSection',
      title: 'Pricing Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text'
        },
        {
          name: 'cards',
          title: 'Pricing Cards',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              {
                name: 'title',
                title: 'Title',
                type: 'string'
              },
              {
                name: 'price',
                title: 'Price',
                type: 'string'
              },
              {
                name: 'description',
                title: 'Description',
                type: 'text'
              },
              {
                name: 'features',
                title: 'Features',
                type: 'array',
                of: [{
                  type: 'object',
                  fields: [
                    {
                      name: 'text',
                      title: 'Feature Text',
                      type: 'string'
                    },
                    {
                      name: 'info',
                      title: 'Feature Info',
                      type: 'string'
                    }
                  ]
                }]
              }
            ]
          }]
        }
      ]
    },
    {
      name: 'contactForm',
      title: 'Contact Form',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string'
        },
        {
          name: 'fields',
          title: 'Form Fields',
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name Field',
              type: 'object',
              fields: [
                { name: 'label', type: 'string' },
                { name: 'placeholder', type: 'string' }
              ]
            },
            {
              name: 'email',
              title: 'Email Field',
              type: 'object',
              fields: [
                { name: 'label', type: 'string' },
                { name: 'placeholder', type: 'string' }
              ]
            },
            {
              name: 'phone',
              title: 'Phone Field',
              type: 'object',
              fields: [
                { name: 'label', type: 'string' },
                { name: 'placeholder', type: 'string' }
              ]
            },
            {
              name: 'company',
              title: 'Company Field',
              type: 'object',
              fields: [
                { name: 'label', type: 'string' },
                { name: 'placeholder', type: 'string' }
              ]
            },
            {
              name: 'message',
              title: 'Message Field',
              type: 'object',
              fields: [
                { name: 'label', type: 'string' },
                { name: 'placeholder', type: 'string' }
              ]
            }
          ]
        },
        {
          name: 'submitButton', type: 'string', title: 'Submit Button Text'
        }
      ]
    }
  ]
})