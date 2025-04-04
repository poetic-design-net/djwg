import {visionTool} from '@sanity/vision'
import {defineConfig, type SchemaTypeDefinition} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {media} from 'sanity-plugin-media'
import {assist} from '@sanity/assist'
import {simplerColorInput} from 'sanity-plugin-simpler-color-input'
import {documentInternationalization} from '@sanity/document-internationalization'
import generateTailwindPlugin from './documentActions/generateTailwind'

import {schemaTypes} from './schemas'
import {myStructure} from './structure'

const config = defineConfig({
  basePath: '/',
  projectId: 'kijh3dc6',
  dataset: 'production',
  name: 'DJWG',
  title: 'DJWG',
  plugins: [
    structureTool({
      structure: myStructure
    }),
    presentationTool({
      previewUrl: {
        origin: 'http://localhost:5173/',
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable',
        },
      },
    }),
    visionTool(),
    generateTailwindPlugin,
    media(),
    assist(),
    simplerColorInput(),
    documentInternationalization({
      supportedLanguages: [
        {id: 'de', title: 'Deutsch'},
        {id: 'en', title: 'English'}
      ],
      schemaTypes: [
        'post',
        'page',
        'ausstellerPage'
      ],
    }),
  ],
  schema: {
    types: schemaTypes as SchemaTypeDefinition[],
  },
})

export default config
