import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'

import {schemaTypes} from './schemas'

const config = defineConfig({
  basePath: '/',
  projectId: 'kijh3dc6',
  dataset: 'production',
  name: 'project-name',
  title: 'Project Name',
  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        origin: 'https://djwg-app.vercel.app/',
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable',
        },
      },
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})

export default config
