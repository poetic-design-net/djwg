import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || '',
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: false
});

const navigationItem = {
  _type: 'navigation',
  title: 'Club Manager',
  type: 'direct',
  sortOrder: 90,
  directLink: '/club-manager',
  linkType: 'direct'
};

const run = async () => {
  try {
    const result = await client.create(navigationItem);
    console.log('Navigation item created:', result);
  } catch (error) {
    console.error('Error creating navigation item:', error);
  }
};

run();