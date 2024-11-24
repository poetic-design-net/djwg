// Re-export everything from individual query files
export * from './queries/events';
export * from './queries/artists';
export * from './queries/content';
export * from './queries/posts';
export * from './queries/index';

// SEO Fragment für Queries
const seoFields = `
  seo {
    metaTitle,
    metaDescription,
    "ogImage": ogImage.asset->url
  }
`
