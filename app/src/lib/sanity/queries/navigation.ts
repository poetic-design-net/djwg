import groq from 'groq'

export const navigationQuery = groq`
{
  "workshops": *[_type == "navigation" && menuKey == "workshops"][0] {
    _id,
    _type,
    menuKey,
    type,
    title,
    "pageLink": pageLink->{
      _id,
      _type,
      "slug": slug.current
    },
    sectionId,
    featured {
      title,
      description,
      "image": coalesce(image.asset->url, ''),
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
  },
  "join": *[_type == "navigation" && menuKey == "join"][0] {
    _id,
    _type,
    menuKey,
    type,
    title,
    "pageLink": pageLink->{
      _id,
      _type,
      "slug": slug.current
    },
    sectionId,
    featured {
      title,
      description,
      "image": coalesce(image.asset->url, ''),
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
  },
  "about": *[_type == "navigation" && menuKey == "about"][0] {
    _id,
    _type,
    menuKey,
    type,
    title,
    "pageLink": pageLink->{
      _id,
      _type,
      "slug": slug.current
    },
    sectionId,
    featured {
      title,
      description,
      "image": coalesce(image.asset->url, ''),
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
  image: string
  link: string
  linkType: LinkType
}

export type NavigationItem = {
  _id: string
  _type: string
  menuKey: 'workshops' | 'join' | 'about'
  type: NavigationType
  title: string
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

export type NavigationData = {
  [K in NavigationItem['menuKey']]?: NavigationItem
}

export function transformNavigationData(data: any): NavigationData {
  console.log('Raw navigation data:', data);
  
  // If data is already in the correct format, return it
  if (data && typeof data === 'object' && ('workshops' in data || 'join' in data || 'about' in data)) {
    console.log('Navigation data is already structured:', data);
    // Ensure type is set for each item
    Object.values(data).forEach((item: any) => {
      if (item) {
        item.type = item.type || 'megamenu';
      }
    });
    return data as NavigationData;
  }

  // If data is an array, transform it
  if (Array.isArray(data)) {
    console.log('Transforming navigation array:', data);
    return data.reduce((acc, item) => {
      if (item && item.menuKey) {
        acc[item.menuKey] = {
          ...item,
          type: item.type || 'megamenu',
          pageLink: item.pageLink,
          sectionId: item.sectionId,
          featured: item.featured ? {
            ...item.featured,
            image: item.featured.image || '',
            linkType: item.featured.linkType || 'page'
          } : undefined
        };
      }
      return acc;
    }, {} as NavigationData);
  }

  // If no valid data, return empty structure
  console.log('No valid navigation data, returning empty structure');
  return {
    workshops: undefined,
    join: undefined,
    about: undefined
  };
}

export function isValidNavigationData(data: unknown): data is NavigationData {
  if (!data || typeof data !== 'object') {
    console.log('Navigation data is not an object:', data);
    return false;
  }

  const requiredKeys = ['workshops', 'join', 'about'] as const;
  const dataKeys = Object.keys(data);

  // Check if all required keys exist
  const hasAllKeys = requiredKeys.every(key => dataKeys.includes(key));
  if (!hasAllKeys) {
    console.log('Missing required navigation keys');
    return false;
  }

  // Check if at least one key has data
  const hasAnyData = requiredKeys.some(key => (data as NavigationData)[key] !== undefined);
  if (!hasAnyData) {
    console.log('No navigation data available');
    return false;
  }

  return true;
}

export function validateNavigationItem(item: unknown): item is NavigationItem {
  if (!item || typeof item !== 'object') return false;

  const itemObj = item as NavigationItem;
  const isValid = (
    typeof itemObj._id === 'string' &&
    typeof itemObj._type === 'string' &&
    typeof itemObj.menuKey === 'string' &&
    typeof itemObj.title === 'string' &&
    (!itemObj.featured || validateFeaturedContent(itemObj.featured)) &&
    (!itemObj.columns || (Array.isArray(itemObj.columns) && itemObj.columns.every(validateMenuColumn))) &&
    (!itemObj.quickLinks || (Array.isArray(itemObj.quickLinks) && itemObj.quickLinks.every(validateMenuLink)))
  );

  if (!isValid) {
    console.log('Invalid navigation item:', itemObj);
  }

  return isValid;
}

function validateFeaturedContent(featured: unknown): featured is FeaturedContent {
  if (!featured || typeof featured !== 'object') return false;

  const featuredObj = featured as FeaturedContent;
  const isValid = (
    typeof featuredObj.title === 'string' &&
    typeof featuredObj.description === 'string' &&
    typeof featuredObj.image === 'string' &&
    typeof featuredObj.link === 'string' &&
    (featuredObj.linkType === 'anchor' || featuredObj.linkType === 'page')
  );

  if (!isValid) {
    console.log('Invalid featured content:', featuredObj);
  }

  return isValid;
}

function validateMenuColumn(column: unknown): column is MenuColumn {
  if (!column || typeof column !== 'object') return false;

  const columnObj = column as MenuColumn;
  const isValid = (
    typeof columnObj.title === 'string' &&
    Array.isArray(columnObj.items) &&
    columnObj.items.every(validateMenuLink)
  );

  if (!isValid) {
    console.log('Invalid menu column:', columnObj);
  }

  return isValid;
}

function validateMenuLink(link: unknown): link is MenuLink {
  if (!link || typeof link !== 'object') return false;

  const linkObj = link as MenuLink;
  const isValid = (
    typeof linkObj.label === 'string' &&
    typeof linkObj.link === 'string' &&
    (linkObj.linkType === 'anchor' || linkObj.linkType === 'page')
  );

  if (!isValid) {
    console.log('Invalid menu link:', linkObj);
  }

  return isValid;
}
