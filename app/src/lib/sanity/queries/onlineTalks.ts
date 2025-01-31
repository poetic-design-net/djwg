import groq from 'groq'

export const onlineTalksQuery = groq`
*[_type == "onlineTalk"] | order(date asc) {
  _id,
  title,
  date,
  link,
  password,
  visibleFromHours
}`