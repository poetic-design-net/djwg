import { goto } from '$app/navigation'
import type { MenuItem } from '$lib/types/menu'

export const navigateToSection = async (
  item: MenuItem, 
  pages?: Record<string, { slug: { current: string } }> | undefined
) => {
  if (!hasValidSection(item)) return

  const href = buildNavigationHref(item, pages)
  if (!href) {
    console.error('Could not build URL:', { item, pages })
    return
  }

  console.log('Navigating to:', href)
  await goto(href)
  
  // Wenn eine Section ID vorhanden ist, scrolle dorthin
  if (item.sectionId) {
    // Warte kurz auf das Laden der Seite
    setTimeout(() => {
      const element = document.getElementById(item.sectionId as string)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

// Prüft ob ein MenuItem eine gültige Section-Referenz hat
export const hasValidSection = (item: MenuItem): boolean => {
  if (item.type !== 'direct') return false;

  // Prüfe auf direkten slug im pageLink
  if (item.pageLink && 'slug' in item.pageLink) {
    if (typeof item.pageLink.slug === 'string' || item.pageLink.slug?.current) {
      return true;
    }
  }

  // Prüfe auf _ref oder _id im pageLink
  if (item.pageLink && ('_ref' in item.pageLink || '_id' in item.pageLink)) {
    return true;
  }

  // Fallback: Prüfe directLink
  return typeof item.directLink === 'string' && item.directLink.length > 0;
}

// Helper to build href for navigation items
export const buildNavigationHref = (
  item: MenuItem,
  pages?: Record<string, { slug: { current: string } }> | undefined
): string | null => {
  console.log('buildNavigationHref called with:', {
    item: JSON.stringify(item, null, 2),
    pages: JSON.stringify(pages, null, 2)
  });

  if (item.type !== 'direct') {
    console.log('Not a direct link, returning null');
    return null;
  }

  // Wenn wir einen pageLink haben
  if (item.pageLink) {
    let slug: string | undefined;

    // Fall 1: Direktes Page-Objekt mit string slug
    if ('slug' in item.pageLink && typeof item.pageLink.slug === 'string') {
      slug = item.pageLink.slug;
    }
    // Fall 2: Direktes Page-Objekt mit slug.current
    else if ('slug' in item.pageLink && item.pageLink.slug?.current) {
      slug = item.pageLink.slug.current;
    }
    // Fall 3: Reference auf eine Page mit _ref
    else if ('_ref' in item.pageLink && pages) {
      const possibleRefs = [
        item.pageLink._ref,
        item.pageLink._ref.replace('drafts.', ''),
        `drafts.${item.pageLink._ref}`
      ];

      for (const ref of possibleRefs) {
        const page = pages[ref];
        if (page?.slug?.current) {
          slug = page.slug.current;
          break;
        }
      }
    }
    // Fall 4: Reference auf eine Page mit _id
    else if ('_id' in item.pageLink && pages) {
      const possibleIds = [
        item.pageLink._id,
        item.pageLink._id.replace('drafts.', ''),
        `drafts.${item.pageLink._id}`
      ];

      for (const id of possibleIds) {
        const page = pages[id];
        if (page?.slug?.current) {
          slug = page.slug.current;
          break;
        }
      }
    }

    if (slug) {
      console.log('Found slug:', slug);
      const href = item.sectionId
        ? `/${slug}#${item.sectionId}`
        : `/${slug}`;
      console.log('Built href:', href);
      return href;
    }
  }

  // Legacy: Fallback auf directLink
  if (item.directLink) {
    console.log('Using directLink:', item.directLink);
    const href = item.sectionId
      ? `${item.directLink}#${item.sectionId}`
      : item.directLink;
    console.log('Built href from directLink:', href);
    return href;
  }

  console.warn('No valid href source found');
  return null;
}