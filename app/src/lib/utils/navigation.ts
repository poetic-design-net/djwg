import { goto, invalidate } from '$app/navigation'
import type { MenuItem } from '$lib/types/menu'

interface PageReference {
  _ref?: string;
  _id?: string;
  slug?: string;
}

export const navigateToSection = async (
  item: MenuItem,
  pages?: Record<string, { slug: string }> | undefined
) => {
  if (!hasValidSection(item)) return

  const href = buildNavigationHref(item, pages)
  if (!href) return

  try {
    // Einfache Navigation ohne zusätzliche Invalidierungen
    await goto(href, {
      replaceState: false,
      keepFocus: false
    })

    // Scrolle zur Section wenn nötig
    if (item.sectionId) {
      const element = document.getElementById(item.sectionId as string)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  } catch (error) {
    console.error('Navigation error:', error)
  }
}

// Prüft ob ein MenuItem eine gültige Section-Referenz hat
export const hasValidSection = (item: MenuItem): boolean => {
  if (item.type !== 'direct') return false;

  if (item.linkType === 'page' && item.pageLink) {
    const pageLink = item.pageLink as PageReference;
    if (typeof pageLink.slug === 'string') {
      return true;
    }
    if (pageLink._ref || pageLink._id) {
      return true;
    }
  }

  // Für direkte Links
  if (item.linkType === 'direct' && item.directLink) {
    return true;
  }

  return false;
}

// Helper to build href for navigation items
export const buildNavigationHref = (
  item: MenuItem,
  pages?: Record<string, { slug: string }> | undefined
): string | null => {
  if (item.type !== 'direct') {
    return null;
  }

  // Wenn linkType "direct" ist, verwende den directLink
  if (item.linkType === 'direct' && item.directLink) {
    return item.sectionId
      ? `${item.directLink}#${item.sectionId}`
      : item.directLink;
  }

  // Wenn linkType "page" ist, verwende die Page-Referenz
  if (item.linkType === 'page' && item.pageLink && typeof item.pageLink === 'object') {
    const pageLink = item.pageLink as PageReference;
    let slug: string | undefined;

    // Fall 1: Direktes Page-Objekt mit slug
    if (typeof pageLink.slug === 'string') {
      slug = pageLink.slug;
    }
    // Fall 2: Reference auf eine Page mit _ref
    else if (pageLink._ref && pages) {
      const possibleRefs = [
        pageLink._ref,
        pageLink._ref.replace('drafts.', ''),
        `drafts.${pageLink._ref}`
      ];

      for (const ref of possibleRefs) {
        const page = pages[ref];
        if (page?.slug) {
          slug = page.slug;
          break;
        }
      }
    }
    // Fall 3: Reference auf eine Page mit _id
    else if (pageLink._id && pages) {
      const possibleIds = [
        pageLink._id,
        pageLink._id.replace('drafts.', ''),
        `drafts.${pageLink._id}`
      ];

      for (const id of possibleIds) {
        const page = pages[id];
        if (page?.slug) {
          slug = page.slug;
          break;
        }
      }
    }

    if (slug) {
      return item.sectionId
        ? `/${slug}#${item.sectionId}`
        : `/${slug}`;
    }
  }

  // Fallback: Verwende title als Slug
  if (item.title) {
    const slug = item.title.toLowerCase().replace(/\s+/g, '-');
    return item.sectionId
      ? `/${slug}#${item.sectionId}`
      : `/${slug}`;
  }
  return null;
}