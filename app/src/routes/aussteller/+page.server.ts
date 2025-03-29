import { client } from '$lib/sanity/client'
import { ausstellerPageQuery, ticketsQuery } from '$lib/sanity/queries/aussteller'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [ausstellerPage, settings, tickets] = await Promise.all([
    client.fetch(ausstellerPageQuery),
    client.fetch(`*[_type == "siteSettings"][0]`),
    client.fetch(ticketsQuery)
  ])

  // Die Areas werden bereits durch die ausstellerPageQuery geladen
  // und sind in ausstellerPage.areasSection.areas verfügbar

  return {
    ausstellerPage,
    settings,
    tickets
  }
}

export const actions = {
  default: async ({ request }) => {
    try {
      const data = await request.formData()
      const name = data.get('name')
      const email = data.get('email')
      const phone = data.get('phone')
      const website = data.get('website')
      const company = data.get('company')
      const industry = data.get('industry')
      const products = data.get('products')
      const logoId = data.get('logoId')
      const message = data.get('message')

      if (!name || !email || !message) {
        return {
          error: 'Bitte fülle alle erforderlichen Felder aus.',
          values: Object.fromEntries(data)
        }
      }
      
      const logo = logoId ? {
        id: logoId,
        type: 'media_upload'
      } : null;

      // Hier können Sie die E-Mail-Versand-Logik implementieren
      // await sendEmail({...})

      return {
        success: true,
        message: 'Vielen Dank für deine Anfrage! Wir melden uns in Kürze bei dir.'
      }
    } catch (error) {
      console.error('Partner form error:', error)
      return {
        error: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      }
    }
  }
}
