import type { Section } from '../types'
import React from 'react'

const InfoComponent = () => {
  return React.createElement('div', { 
    style: { 
      padding: '1rem',
      background: '#f3f3f3',
      borderRadius: '4px',
      margin: '1rem'
    } 
  },
    React.createElement('h2', { 
      style: { 
        marginBottom: '0.5rem',
        color: '#333'
      } 
    }, 'Event Verwaltung'),
    React.createElement('p', {
      style: {
        color: '#666',
        lineHeight: '1.4'
      }
    }, 'Die Erstellung und Bearbeitung von Events erfolgt im Content-Bereich unter "Content > Events > All Events".')
  )
}

export const eventsSection: Section = (S) =>
  S.listItem()
    .title('Event Settings')
    .child(
      S.list()
        .title('Event Settings')
        .items([
          // Info Component
          S.listItem()
            .title('Info')
            .child(
              S.component()
                .title('Event Creation Info')
                .component(InfoComponent)
            ),

          S.divider(),

          // Event Settings
          S.listItem()
            .title('Page Settings')
            .child(
              S.document()
                .schemaType('eventPage')
                .documentId('eventPage')
                .views([
                  S.view
                    .form()
                    .id('main')
                    .title('Main Settings'),
                  S.view
                    .form()
                    .id('seo')
                    .title('SEO')
                ])
            ),

          // Event Schedule
          S.listItem()
            .title('Schedule')
            .child(
              S.documentList()
                .title('Event Schedule')
                .schemaType('eventSchedule')
                .filter('_type == "eventSchedule"')
            ),

          // Time Slots
          S.listItem()
            .title('Time Slots')
            .child(
              S.documentList()
                .title('Time Slots')
                .schemaType('timeSlot')
                .filter('_type == "timeSlot"')
            )
        ])
    )
