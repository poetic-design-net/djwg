import groq from 'groq'
import type { Image } from '@sanity/types'

export const navigationQuery = groq`
*[_type == "navigation"] | order(sortOrder asc) {
  _id,
  _type,
  type,
  title,
  sortOrder,
  linkType,
  directLink,
  "pageLink": pageLink->{
    _id,
    _type,
    "slug": slug.current
  },
  sectionId,
  featured {
    title,
    description,
    "image": {
      "_type": "image",
      "asset": image.asset->,
      "hotspot": image.hotspot,
      "crop": image.crop,
      "alt": image.alt
    },
    link,
    linkType
  },
  columns[] {
    title,
    items[] {
      label,
      link,
      linkType
    }
  },
  quickLinks[] {
    label,
    link,
    linkType
  }
}`

export type LinkType = 'anchor' | 'page';
export type NavigationType = 'megamenu' | 'direct';

export type MenuLink = {
  label: string
  link: string
  linkType: LinkType
}

export type MenuColumn = {
  title: string
  items: MenuLink[]
}

export type FeaturedContent = {
  title: string
  description: string
  image: Image | null
  link: string
  linkType: LinkType
}

export type NavigationItem = {
  _id: string
  _type: string
  type: NavigationType
  title: string
  sortOrder: number
  linkType?: 'page' | 'direct'
  directLink?: string
  pageLink?: {
    _id: string
    _type: string
    slug: string
  }
  sectionId?: string
  featured?: FeaturedContent
  columns?: MenuColumn[]
  quickLinks?: MenuLink[]
}

export type NavigationData = NavigationItem[]

interface RawNavigationItem {
  _id: string;
  _type: string;
  type?: NavigationType;
  title: string;
  sortOrder: number;
  linkType?: 'page' | 'direct';
  directLink?: string;
  pageLink?: {
    _id: string;
    _type: string;
    slug: string;
  };
  sectionId?: string;
  featured?: {
    title: string;
    description: string;
    image?: Image;
    link: string;
    linkType: LinkType;
  };
  columns?: Array<{
    title: string;
    items: Array<{
      label: string;
      link: string;
      linkType: LinkType;
    }>;
  }>;
  quickLinks?: Array<{
    label: string;
    link: string;
    linkType: LinkType;
  }>;
}

export function transformNavigationData(data: unknown): NavigationData {
  console.log('Raw navigation data:', JSON.stringify(data, null, 2));
  
  if (!data || !Array.isArray(data)) {
    console.log('No valid navigation data, returning empty array');
    return [];
  }

  try {
    const result = data
      .map((item): NavigationItem | null => {
        const rawItem = item as RawNavigationItem;
        
        if (!rawItem._id || !rawItem.title || typeof rawItem.sortOrder !== 'number') {
          console.log('Missing required fields in navigation item:', rawItem);
          return null;
        }

        // Validiere und transformiere pageLink
        const transformedPageLink = rawItem.pageLink && {
          _id: rawItem.pageLink._id,
          _type: rawItem.pageLink._type || 'page',
          slug: rawItem.pageLink.slug
        };

        // Validiere und transformiere featured content
        const transformedFeatured = rawItem.featured && {
          title: rawItem.featured.title,
          description: rawItem.featured.description,
          image: rawItem.featured.image || null,
          link: rawItem.featured.link,
          linkType: rawItem.featured.linkType
        };

        const transformedItem: NavigationItem = {
          _id: rawItem._id,
          _type: rawItem._type,
          type: rawItem.type || 'megamenu',
          title: rawItem.title,
          sortOrder: rawItem.sortOrder,
          ...(rawItem.linkType && { linkType: rawItem.linkType }),
          ...(rawItem.directLink && { directLink: rawItem.directLink }),
          ...(transformedPageLink && { pageLink: transformedPageLink }),
          ...(rawItem.sectionId && { sectionId: rawItem.sectionId }),
          ...(transformedFeatured && { featured: transformedFeatured }),
          columns: rawItem.columns?.map(col => ({
            title: col.title,
            items: col.items.filter(i => i.label && i.link)
          })) || [],
          quickLinks: rawItem.quickLinks?.filter(link => link.label && link.link) || []
        };

        return transformedItem;
      })
      .filter((item): item is NavigationItem => item !== null);

    console.log('Transformed navigation data:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error transforming navigation data:', error);
    return [];
  }
}

export function isValidNavigationData(data: unknown): data is NavigationData {
  if (!Array.isArray(data)) {
    console.log('Navigation data is not an array:', data);
    return false;
  }

  return data.every((item): item is NavigationItem => {
    if (!item || typeof item !== 'object') {
      console.log('Invalid navigation item:', item);
      return false;
    }

    const navItem = item as NavigationItem;
    return (
      typeof navItem._id === 'string' &&
      typeof navItem._type === 'string' &&
      typeof navItem.title === 'string' &&
      typeof navItem.sortOrder === 'number' &&
      (navItem.type === 'megamenu' || navItem.type === 'direct')
    );
  });
}
