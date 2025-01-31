import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'onlineTalk',
  title: 'Online Talk',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'date',
      title: 'Datum & Uhrzeit',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'link',
      title: 'Meeting Link',
      type: 'url',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'password',
      title: 'Meeting Passwort',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'visibleFromHours',
      title: 'Stunden vor Start sichtbar',
      description: 'Anzahl der Stunden vor Beginn, ab wann Link & Passwort sichtbar sein sollen',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    })
  ]
})