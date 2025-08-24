import type { PageServerLoad } from './$types'
import { client } from '$lib/sanity/client'
import { exhibitionDataQuery } from '$lib/sanity/queries/exhibition'
import type { ExhibitionHall, ExhibitionStand, Exhibitor } from '$lib/types/exhibition'
import { isAdmin } from '$lib/config/admin.server'
import { mockHalls, mockStands, mockExhibitors } from '$lib/data/mockExhibitionData'

// Enable mock data for development
const USE_MOCK_DATA = false // Set to true to use mock data

export const load: PageServerLoad = async ({ locals }) => {
  // Check if user is admin
  const adminStatus = await isAdmin(locals)

  try {
    let data
    
    if (USE_MOCK_DATA) {
      // Use mock data for development
      console.log('Using mock exhibition data')
      data = {
        halls: mockHalls,
        stands: mockStands,
        exhibitors: mockExhibitors
      }
    } else {
      // Fetch from Sanity
      data = await client.fetch(exhibitionDataQuery)
      
      // Debug: Log fetched data
      console.log('Fetched exhibition data from Sanity:', {
        hallsCount: data.halls?.length || 0,
        standsCount: data.stands?.length || 0,
        exhibitorsCount: data.exhibitors?.length || 0,
        firstHall: data.halls?.[0]
      })
      
      // If no data from Sanity and in development, use mock data as fallback
      if ((!data.halls || data.halls.length === 0) && process.env.NODE_ENV === 'development') {
        console.log('No Sanity data found, using mock data as fallback')
        data = {
          halls: mockHalls,
          stands: mockStands,
          exhibitors: mockExhibitors
        }
      }
    }
    
    // Filter out secret items for non-admin users
    let halls: ExhibitionHall[] = data.halls || []
    let stands: ExhibitionStand[] = data.stands || []
    let exhibitors: Exhibitor[] = data.exhibitors || []

    if (!adminStatus) {
      // Filter out secret halls
      halls = halls.filter(hall => !hall.isSecret)
      
      // Filter out stands that are secret or belong to secret halls/exhibitors
      stands = stands.filter(stand => 
        !stand.isSecret && 
        !stand.hall?.isSecret && 
        !stand.exhibitor?.isSecret
      )
      
      // Filter out secret exhibitors
      exhibitors = exhibitors.filter(exhibitor => !exhibitor.isSecret)
    }

    return {
      halls,
      stands,
      exhibitors,
      isAdmin: adminStatus,
    }
  } catch (error) {
    console.error('Error fetching exhibition data:', error)
    
    // Return empty data on error
    return {
      halls: [],
      stands: [],
      exhibitors: [],
      isAdmin: adminStatus,
    }
  }
}