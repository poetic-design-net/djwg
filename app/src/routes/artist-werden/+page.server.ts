import { client } from '$lib/sanity/client'
import { artistPageQuery } from '$lib/sanity/queries/artist-partner'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [artistPage, settings] = await Promise.all([
    client.fetch(artistPageQuery),
    client.fetch(`*[_type == "siteSettings"][0]`)
  ])

  return {
    artistPage,
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
      const experience = data.get('experience')
      const instagram = data.get('instagram')
      const soundcloud = data.get('soundcloud')
      const message = data.get('message')

      if (!name || !email || !experience || !message) {
        return {
          error: 'Bitte fülle alle erforderlichen Felder aus.',
          values: Object.fromEntries(data)
        }
      }

      // Hier können Sie die E-Mail-Versand-Logik implementieren
      // Beispiel:
      // await sendEmail({
      //   to: 'artists@example.com',
      //   subject: 'Neue Artist-Bewerbung',
      //   body: `
      //     Name: ${name}
      //     Email: ${email}
      //     Telefon: ${phone}
      //     Erfahrung: ${experience}
      //     Instagram: ${instagram}
      //     SoundCloud: ${soundcloud}
      //     Nachricht: ${message}
      //   `
      // })

      return {
        success: true,
        message: 'Vielen Dank für deine Bewerbung! Wir melden uns in Kürze bei dir.'
      }
    } catch (error) {
      console.error('Artist application form error:', error)
      return {
        error: 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      }
    }
  }
}
