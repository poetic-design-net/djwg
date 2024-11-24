// Re-export everything from individual query files
export * from './events';
export * from './artists';
export * from './content';
export * from './posts';

// Common types that might be shared across queries
export interface SanityAsset {
  _ref: string;
  _type: 'reference';
}

export interface SanityImage {
  asset: SanityAsset;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Helper type for Sanity query responses
export interface QueryResponse<T> {
  data: T;
  error?: Error;
}
