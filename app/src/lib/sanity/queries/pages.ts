import { client } from '$lib/sanity/client';
import type { UserBadge } from '$lib/utils/badge-utils';
import { filterPagesByUserBadges } from '$lib/utils/badge-utils';

export const pagesQuery = `
  *[_type == "page"] {
    _id,
    _type,
    title,
    "slug": slug.current,
    content,
    "requiredBadges": requiredBadges[]-> {
      _id,
      name,
      slug,
      supabaseId,
      permissions
    },
    // Hole alle benötigten Referenzdaten
    "events": *[_type == "event"] | order(startDate asc) {
      _id,
      title,
      startDate,
      endDate,
      description,
      location,
      image {
        asset->,
        alt,
        hotspot,
        crop
      }
    },
    "founder": *[_type == "founder"][0] {
      _id,
      name,
      role,
      description,
      image {
        asset->,
        alt,
        hotspot,
        crop
      }
    },
    sections[] {
      ...,
      _key,
      _type == 'componentSection' => {
        ...,
        _type,
        type,
        heroSection {
          eyebrow,
          title,
          subtitle,
          backgroundImages[] {
            asset->,
            alt,
            hotspot,
            crop
          },
          transitionInterval,
          primaryButton {
            text,
            link
          },
          secondaryButton {
            text,
            link
          }
        },
        introSection {
          title[] {
            ...,
            children[] {
              ...
            }
          },
          description[] {
            ...,
            children[] {
              ...
            }
          },
          image {
            asset->,
            alt,
            hotspot,
            crop
          },
          items[] {
            icon,
            title,
            description
          },
          cta {
            text,
            link
          },
          secondaryCta {
            text,
            link
          }
        },
        artistsSection {
          eyebrow,
          title,
          description,
          displayType,
          selectedArtists[]-> {
            _id,
            name,
            role,
            description,
            image {
              asset->,
              alt,
              hotspot,
              crop
            },
            socials
          },
          isLineupRevealed
        },
        pricingSection {
          title,
          description,
          showEventSelector,
          selectedTickets[]-> {
            _id,
            phase,
            title,
            description,
            features,
            status,
            price,
            currency,
            url
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
            alt,
            hotspot,
            crop
          }
        },
        merchSection {
          title,
          description,
          "products": *[_type == "merchProduct" && !(_id in path("drafts.**"))] {
            ...,
            _id,
            _type,
            title,
            description,
            features,
            price,
            currency,
            image {
              ...,
              asset->,
              alt,
              hotspot,
              crop
            },
            shopUrl
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

export function transformPagesData(rawPages: any[], userBadges?: UserBadge[]) {
  if (!Array.isArray(rawPages)) {
    console.error('Expected pages data to be an array:', rawPages);
    return {};
  }

  console.log('Transforming pages:', JSON.stringify(rawPages, null, 2));
  
  let pages: Record<string, any> = {};
  
  // Erst alle Pages transformieren
  rawPages.forEach(page => {
    if (page._id && page.slug) {
      console.log('Processing page:', {
        id: page._id,
        slug: page.slug,
        sectionsCount: page.sections?.length,
        sectionTypes: page.sections?.map((s: any) => s.type),
        requiredBadges: page.requiredBadges?.map((b: any) => b.supabaseId)
      });
      
      const id = page._id;
      const withoutDrafts = id.replace('drafts.', '');
      const withDrafts = id.startsWith('drafts.') ? id : `drafts.${id}`;

      // Speichere die vollständige Seite unter allen möglichen IDs
      [id, withoutDrafts, withDrafts].forEach(possibleId => {
        pages[possibleId] = page;
      });
    } else {
      console.warn('Invalid page data:', page);
    }
  });

  // Dann die Pages nach Badges filtern
  if (userBadges) {
    pages = filterPagesByUserBadges(pages, userBadges);
  }

  console.log('Transformed pages:', JSON.stringify(pages, null, 2));
  return pages;
}