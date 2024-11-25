import { json } from '@sveltejs/kit'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Execute the generate-tailwind script
    const { stdout, stderr } = await execAsync('pnpm generate-tailwind')
    
    if (stderr) {
      console.error('Error generating Tailwind config:', stderr)
      return json({ error: 'Failed to generate Tailwind config' }, { status: 500 })
    }

    console.log('Tailwind config generation output:', stdout)
    return json({ message: 'Tailwind config generated successfully' })
  } catch (error) {
    console.error('Error executing script:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
