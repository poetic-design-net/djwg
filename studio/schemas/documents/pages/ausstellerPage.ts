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
      name: 'partnerTag',
      title: 'Partner Tag',
      description: 'Kleiner Text über dem Haupttitel (z.B. "Partner & Aussteller")',
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
      name: 'areasSection',
      title: 'Areas Section',
      type: 'object',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text' },
        {
          name: 'areas',
          title: 'Areas',
          type: 'array',
          of: [{ type: 'reference', to: [{ type: 'area' }] }]
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
      name: 'ticketSection', // Umbenannt
      title: 'Ticket/Package Section', // Titel angepasst
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
        // Entferne priceInfo, cards, addonsSection vollständig
        {
          name: 'tickets', // Neues Feld für Ticket-Referenzen
          title: 'Tickets/Packages', // Titel angepasst
          type: 'array',
          of: [
            {
              type: 'reference',
              to: [{ type: 'ticket' }] // Referenz auf das ticket-Schema
            }
          ]
        },
        {
          name: 'addons',
          title: 'Add-Ons',
          description: 'Zusätzliche Optionen für Aussteller',
          type: 'array',
          of: [
            {
              type: 'object',
              title: 'Add-On',
              fields: [
                {
                  name: 'title',
                  title: 'Title',
                  type: 'string',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'string'
                },
                {
                  name: 'price',
                  title: 'Price',
                  type: 'number',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'currency',
                  title: 'Currency',
                  type: 'string',
                  initialValue: 'EUR'
                },
                {
                  name: 'info',
                  title: 'Info Text',
                  description: 'Text für den Info-Tooltip',
                  type: 'string'
                },
                {
                  name: 'forPackages',
                  title: 'Für Pakete',
                  description: 'Für welche Pakete ist dieses Add-On verfügbar',
                  type: 'string'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'contactLink',
      title: 'Contact Link',
      type: 'object',
      fields: [
        { name: 'text', title: 'Link Text', type: 'string' },
        { name: 'url', title: 'Link URL', type: 'string' } // Oder 'url' Typ, wenn externe Links erlaubt sind
      ]
    },
    {
      name: 'contactSeparatorText',
      title: 'Contact Separator Text',
      description: 'Text zwischen Link und Formular (z.B. "oder")',
      type: 'string'
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