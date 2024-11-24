export type LinkType = 'anchor' | 'page';

export interface MenuLink {
  label: string;
  link: string;
  linkType: LinkType;
}

export interface MenuColumn {
  title: string;
  items: MenuLink[];
}

export interface FeaturedContent {
  title: string;
  description: string;
  image: string;
  link: string;
  linkType: LinkType;
}

export interface MenuItem {
  _id?: string;
  _type?: string;
  title: string;
  featured: FeaturedContent;
  columns: MenuColumn[];
  quickLinks: MenuLink[];
}

export interface MenuItems {
  workshops?: MenuItem;
  join?: MenuItem;
  about?: MenuItem;
}

export type MenuKey = keyof MenuItems;

export function isValidMenuItem(item: unknown): item is MenuItem {
  if (!item || typeof item !== 'object') return false;

  const menuItem = item as MenuItem;
  return (
    typeof menuItem.title === 'string' &&
    isValidFeaturedContent(menuItem.featured) &&
    Array.isArray(menuItem.columns) &&
    menuItem.columns.every(isValidMenuColumn) &&
    Array.isArray(menuItem.quickLinks) &&
    menuItem.quickLinks.every(isValidMenuLink)
  );
}

export function isValidFeaturedContent(featured: unknown): featured is FeaturedContent {
  if (!featured || typeof featured !== 'object') return false;

  const featuredContent = featured as FeaturedContent;
  return (
    typeof featuredContent.title === 'string' &&
    typeof featuredContent.description === 'string' &&
    typeof featuredContent.image === 'string' &&
    typeof featuredContent.link === 'string' &&
    (featuredContent.linkType === 'anchor' || featuredContent.linkType === 'page')
  );
}

export function isValidMenuColumn(column: unknown): column is MenuColumn {
  if (!column || typeof column !== 'object') return false;

  const menuColumn = column as MenuColumn;
  return (
    typeof menuColumn.title === 'string' &&
    Array.isArray(menuColumn.items) &&
    menuColumn.items.every(isValidMenuLink)
  );
}

export function isValidMenuLink(link: unknown): link is MenuLink {
  if (!link || typeof link !== 'object') return false;

  const menuLink = link as MenuLink;
  return (
    typeof menuLink.label === 'string' &&
    typeof menuLink.link === 'string' &&
    (menuLink.linkType === 'anchor' || menuLink.linkType === 'page')
  );
}

export function createEmptyMenuItems(): MenuItems {
  return {
    workshops: undefined,
    join: undefined,
    about: undefined
  };
}
