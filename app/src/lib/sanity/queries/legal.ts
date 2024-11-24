export const legalPageQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    title,
    content,
    seo
  }
`;
