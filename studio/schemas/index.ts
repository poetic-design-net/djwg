import blockContent from './blockContent'
import ticket from './ticket'
import pricingSection from './objects/pricingSection'
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

// Document Types
import page from './documents/page'
import eventPage from './documents/pages/eventPage'
import homePage from './documents/pages/homePage'
import siteSettings from './documents/settings/siteSettings'

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
  ticket,
  post,
  page,
  homePage,
  eventPage,
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
  merchProduct,
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
