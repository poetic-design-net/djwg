import { client } from '$lib/sanity/client'

export const pagesQuery = `
  *[_type == "page"] {
    _id,
    _type,
    title,
    slug,
    content,
    sections[] {
      _type == 'componentSection' => {
        _type,
        type,
        id,
        introSection {
          title,
          description,
          image {
            asset->,
            alt
          },
          items[] {
            icon,
            title,
            description
          }
        },
        aboutUsSection {
          tagline,
          title,
          paragraphs,
          cta {
            text,
            link
          },
          mainImage {
            asset->,
            alt
          }
        }
      },
      _type == 'contentSection' => {
        _type,
        id,
        title,
        content
      }
    },
    "isDraft": _id match "drafts.**"
  }
`;

export function transformPagesData(rawPages: any[]) {
  if (!Array.isArray(rawPages)) {
    console.error('Expected pages data to be an array:', rawPages);
    return {};
  }

  console.log('Transforming pages:', JSON.stringify(rawPages, null, 2));
  
  const pages: Record<string, { slug: { current: string } }> = {};
  
  rawPages.forEach(page => {
    if (page._id && page.slug) {
      console.log('Processing page:', { id: page._id, slug: page.slug });
      
      const id = page._id;
      const withoutDrafts = id.replace('drafts.', '');
      const withDrafts = id.startsWith('drafts.') ? id : `drafts.${id}`;

      // Speichere unter allen möglichen IDs
      [id, withoutDrafts, withDrafts].forEach(possibleId => {
        pages[possibleId] = {
          slug: { current: page.slug }
        };
      });
    } else {
      console.warn('Invalid page data:', page);
    }
  });

  console.log('Transformed pages:', JSON.stringify(pages, null, 2));
  return pages;
}