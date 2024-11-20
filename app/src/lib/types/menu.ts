export interface MenuItem {
  title: string;
  featured: {
    title: string;
    description: string;
    image: string;
    link: string;
  };
  columns: {
    title: string;
    items: {
      label: string;
      link: string;
    }[];
  }[];
  quickLinks: {
    label: string;
    link: string;
  }[];
}

export interface MenuItems {
  workshops: MenuItem;
  join: MenuItem;
  about: MenuItem;
}

export type MenuKey = keyof MenuItems;
