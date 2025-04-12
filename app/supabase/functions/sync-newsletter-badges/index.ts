import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { load } from 'https://deno.land/std@0.168.0/dotenv/mod.ts'
import config from './config.json' assert { type: 'json' }

interface ErrorResponse {
  message: string
  status: number
  timestamp: string
}

const createErrorResponse = (message: string, status: number): ErrorResponse => ({
  message,
  status,
  timestamp: new Date().toISOString()
})

const isExecutionTimeValid = (): boolean => {
  const now = new Date()
  const [targetHour, targetMinute] = config.schedule.executionTime.split(':').map(Number)
  return now.getHours() === targetHour && now.getMinutes() >= targetMinute
}

const logError = async (error: ErrorResponse) => {
  try {
    console.error(JSON.stringify(error))
    // Hier könnte zusätzliches Logging implementiert werden
  } catch (e) {
    console.error('Logging failed:', e)
  }
}

async function syncNewsletterBadges(adminToken: string): Promise<Response> {
  try {
    if (!isExecutionTimeValid()) {
      throw new Error('Outside of scheduled execution window')
    }

    const response = await fetch(`${config.api.baseUrl}${config.api.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timestamp: new Date().toISOString() })
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    const errorResponse = createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    )
    await logError(errorResponse)
    return new Response(JSON.stringify(errorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: errorResponse.status
    })
  }
}

serve(async (req) => {
  try {
    const adminToken = Deno.env.get(config.security.adminToken)
    if (!adminToken) {
      throw new Error('Admin token not configured')
    }

    return await syncNewsletterBadges(adminToken)
  } catch (error) {
    const errorResponse = createErrorResponse(
      error instanceof Error ? error.message : 'Server configuration error',
      500
    )
    await logError(errorResponse)
    return new Response(JSON.stringify(errorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: errorResponse.status
    })
  }
})