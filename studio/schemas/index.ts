import blockContent from './blockContent'
import award from './award'
import ticket from './ticket'
import pricingSection from './objects/pricingSection'
import djCourse from './djCourse'
import mediaUpload from './mediaUpload'
import category from './category'
import post from './post'
import artist from './artist'
import event from './event'
import eventSchedule from './eventSchedule'
import timeSlot from './timeSlot'
import faq from './faq'
import founder from './founder'
import navigation from './navigation'
import logo from './logo'
import testimonial from './testimonial'
import teamMember from './teamMember'
import knowledgeBaseItem from './knowledgeBaseItem'
import aboutUs from './aboutUs'
import onlineTalk from './onlineTalk'
import badge from './badge'
import video from './video'
import videoCategory from './videoCategory'

// Document Types
import page from './documents/page'
import eventPage from './documents/pages/eventPage'
import homePage from './documents/pages/homePage'
import siteSettings from './documents/settings/siteSettings'
import footerSettings from './documents/settings/footerSettings'
import headerSettings from './documents/settings/headerSettings'
import partnerPage from './documents/pages/partnerPage'
import artistPage from './documents/pages/artistPage'
import nextLevelDjs from './documents/pages/nextLevelDjs'
import merchPage from './documents/pages/merchPage'
import ausstellerPage from './documents/pages/ausstellerPage'

// Object Types
import seo from './objects/seo'
import section from './objects/section'
import aboutUsSection from './objects/aboutUsSection'
import introSection from './objects/introSection'
import optimizedImage from './objects/image'
import faqSection from './objects/faqSection'
import logosSection from './objects/logosSection'
import teamSectionConfig from './objects/teamSectionConfig'
import heroSection from './objects/heroSection'
import artistsSection from './objects/artistsSection'
import testimonialsSection from './objects/testimonialsSection'
import ticketsSection from './objects/ticketsSection'
import socialMediaLink from './objects/socialMediaLink'
import merchProduct from './objects/merchProduct'
import merchSection from './objects/merchSection'

export const schemaTypes = [
  // Documents
  mediaUpload,
  ticket,
  post,
  djCourse,
  page,
  homePage,
  eventPage,
  ausstellerPage,
  partnerPage,
  artistPage,
  nextLevelDjs,
  merchPage,
  artist,
  event,
  eventSchedule,
  timeSlot,
  faq,
  founder,
  navigation,
  logo,
  testimonial,
  teamMember,
  knowledgeBaseItem,
  aboutUs,
  category,
  siteSettings,
  footerSettings,
  headerSettings,
  merchProduct,
  onlineTalk,
  badge,
  award,
  video,
  videoCategory,
  // Objects
  blockContent,
  seo,
  section,
  aboutUsSection,
  introSection,
  optimizedImage,
  faqSection,
  logosSection,
  teamSectionConfig,
  heroSection,
  artistsSection,
  testimonialsSection,
  ticketsSection,
  pricingSection,
  socialMediaLink,
  merchSection
]
