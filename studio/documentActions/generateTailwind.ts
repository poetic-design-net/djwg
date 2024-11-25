import { definePlugin } from 'sanity'
import type { DocumentActionComponent, DocumentActionDescription } from 'sanity'

export const generateTailwindAction: DocumentActionComponent = (props): DocumentActionDescription | null => {
  const appUrl = process.env.SANITY_STUDIO_PREVIEW_URL

  // Only show this action for themeSettings documents
  if (props.type !== 'themeSettings') {
    return null
  }

  return {
    label: 'Generate Tailwind Config',
    onHandle: async () => {
      if (!appUrl) {
        return {
          message: 'Missing PREVIEW_URL environment variable',
          status: 'error'
        }
      }

      try {
        // Call our API endpoint
        const response = await fetch(`${appUrl}/api/generate-tailwind`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to generate Tailwind config')
        }

        return {
          message: 'Tailwind config generated successfully',
          status: 'success'
        }
      } catch (error) {
        console.error('Error generating Tailwind config:', error)
        return {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        }
      }
    },
    tone: 'positive',
    // Show this action next to the Publish button
    shortcut: 'ctrl+alt+g'
  }
}

// Export a function that returns the plugin
export default definePlugin({
  name: 'generate-tailwind',
  document: {
    // Add the action to all document types
    actions: (prev, context) => {
      // Only add the action for themeSettings documents
      if (context.schemaType !== 'themeSettings') {
        return prev
      }
      
      // Add our action after the publish action
      return [...prev, generateTailwindAction]
    }
  }
})
