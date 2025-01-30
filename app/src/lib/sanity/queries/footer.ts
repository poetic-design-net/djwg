export const footerQuery = `*[_type == "footerSettings"][0] {
  columns[] {
    title,
    links[] {
      text,
      url
    }
  },
  socialLinks[] {
    platform,
    url
  },
  bottomText,
  "logo": logo.asset->url
}`