import aboutUs from './aboutUs'
import artist from './artist'
import blockContent from './blockContent'
import event from './event'
import faq from './faq'
import founder from './founder'
import knowledgeBaseItem from './knowledgeBaseItem'
import logo from './logo'
import navigation from './navigation'
import post from './post'
import teamMember from './teamMember'
import testimonial from './testimonial'
import timeSlot from './timeSlot'
import eventSchedule from './eventSchedule'
import category from './category'
import siteSettings from './documents/settings/siteSettings'
import footerSettings from './documents/settings/footerSettings'
import themeSettings from './documents/settings/theme'
import seo from './objects/seo'
import aboutUsSection from './objects/aboutUsSection'
import eventPage from './documents/pages/eventPage'
import homePage from './documents/pages/homePage'
import page from './documents/page'

export const schemaTypes = [
  // Objects
  seo,
  aboutUsSection,
  
  // Documents
  aboutUs,
  artist,
  blockContent,
  category,
  event,
  eventPage,
  eventSchedule,
  faq,
  footerSettings,
  founder,
  homePage,
  knowledgeBaseItem,
  logo,
  navigation,
  page,
  post,
  siteSettings,
  teamMember,
  testimonial,
  themeSettings,
  timeSlot
]
