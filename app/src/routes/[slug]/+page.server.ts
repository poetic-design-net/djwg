import { client } from '$lib/sanity/client';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const { slug } = params;

  console.log('Loading page data for slug:', slug);

  const query = `*[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    content,
      sections[] {
        _type == 'componentSection' => {
          _type,
          type,
          id,
          heroSection {
            title,
            subtitle,
            backgroundImages[] {
              asset->,
              alt
            },
            transitionInterval
          },
          introSection {
          title[] {
            ...,
            children[] {
              ...
            }
          },
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
        },
        faqSection {
          title[] {
            ...,
            children[] {
              ...
            }
          },
          description,
          showCategories,
          selectedFaqs[]-> {
            _id,
            question,
            answer,
            category,
            order
          }
        },
        logosSection {
          title[] {
            ...,
            children[] {
              ...
            }
          },
          description,
          selectedLogos[]-> {
            _id,
            name,
            image {
              asset->,
              alt,
              hotspot,
              crop
            }
          },
          showButton
        },
        teamSectionConfig {
          title[] {
            ...,
            children[] {
              ...
            }
          },
          description,
          selectedMembers[]-> {
            _id,
            name,
            role,
            image {
              asset->,
              alt
            },
            socials
          },
          showLoadMoreButton
        },
        artistsSection {
          title,
          description,
          displayType,
          selectedArtists[]-> {
            _id,
            name,
            role,
            image {
              asset->,
              alt
            },
            socials
          },
          isLineupRevealed
        },
        testimonialsSection {
          title,
          subtitle,
          testimonials[]-> {
            _id,
            name,
            role,
            quote,
            image {
              asset->,
              alt
            }
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
    // Zusätzliche Daten für die verschiedenen Komponenten
    "aboutUsData": *[_type == "aboutUs"][0],
    "artists": *[_type == "artist"] | order(name asc),
    "events": *[_type == "event"] | order(startDate asc),
    "founder": *[_type == "founder"][0],
    "team": *[_type == "teamMember"] | order(order asc),
    "testimonials": *[_type == "testimonial"] | order(order asc)
  }`;

  const page = await client.fetch(query, { slug });

  console.log('Fetched page data:', JSON.stringify(page, null, 2));

  if (!page) {
    throw error(404, {
      message: 'Seite nicht gefunden'
    });
  }

  return {
    page
  };
}
