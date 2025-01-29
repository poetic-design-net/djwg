import { defineType } from 'sanity'

export default defineType({
  name: 'socialMediaLink',
  title: 'Social Media Link',
  type: 'object',
  fields: [
    {
      name: 'platform',
      title: 'Plattform',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'Twitter', value: 'twitter' }
        ]
      }
    },
    {
      name: 'url',
      title: 'URL',
      type: 'url'
    },
    {
      name: 'description',
      title: 'Beschreibung',
      type: 'text',
      rows: 2
    }
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'url'
    }
  }
})