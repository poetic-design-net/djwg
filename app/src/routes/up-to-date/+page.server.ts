import { getSocialMediaLinks } from '$lib/sanity/queries/settings'
import { client } from '$lib/sanity/client'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const data = await client.fetch(getSocialMediaLinks)
  return {
    socialMedia: data?.socialMedia || []
  }
}