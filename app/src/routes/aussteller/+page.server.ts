import { client } from '$lib/sanity/client'
import { partnerPageQuery } from '$lib/sanity/queries/artist-partner'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [partnerPage, settings] = await Promise.all([
    client.fetch(partnerPageQuery),
    client.fetch(`*[_type == "siteSettings"][0]`)
  ])

  return {
    partnerPage,
    settings
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
      
      // Speichere die logoId in der E-Mail mit
      const logo = logoId ? {
        id: logoId,
        type: 'media_upload'
      } : null;

      // Hier können Sie die E-Mail-Versand-Logik implementieren
      // Beispiel:
      // await sendEmail({
      //   to: 'partner@example.com',
      //   subject: 'Neue Partner-Anfrage',
      //   body: `
      //     Name: ${name}
      //     Email: ${email}
      //     Telefon: ${phone}
      //     Website: ${website}
      //     Firma: ${company}
      //     Branche: ${industry}
      //     Logo: ${logo ? `https://your-domain.com/media/${logo.id}` : 'Kein Logo hochgeladen'}
      //     Produkte: ${products}
      //     Nachricht: ${message}
      //   `
      // })

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
