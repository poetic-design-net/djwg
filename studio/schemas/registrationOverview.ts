import { defineType } from 'sanity';

export default defineType({
  name: 'registrationOverview',
  title: 'Registration Overview',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Registration Management',
      readOnly: true
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      initialValue: 'Quick access to all sessions with registration enabled',
      readOnly: true
    }
  ],
  preview: {
    prepare() {
      return {
        title: '📋 Registration Management',
        subtitle: 'Quick access to sessions & registrations'
      };
    }
  }
});